import { useState } from 'react'
import users from '../data/users.json'

interface ProjectStep {
    title: string;
    description: string;
}
  
interface ProjectCardProps {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeRequired: string;
    imageUrl: string;
    rating: number;
    materials: string[];
    steps: ProjectStep[];
    index?: number;
}
  
interface UserData {
    password: string
    name: string
    username: string
    bio: string
    avatar: string
    level: string
    projects: number
    followers: number
    following: number
    joinedDate: string
    badges: string[]
    completedProjects: ProjectCardProps[]
    savedItems: string[]
    activityFeed: any[]
}

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    bio: '',
    avatar: '',
    level: '',
    projects: 0,
    followers: 0,
    following: 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newUser: UserData = {
      ...form,
      joinedDate: new Date().toISOString(),
      badges: [],
      completedProjects: [],
      savedItems: [],
      activityFeed: []
    }

    const existing = users.find(u => u.username === form.username)
    if (existing) return alert("Username already exists!")

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    alert("User registered! Now login.")
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Full Name" onChange={handleChange} />
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} />
      <textarea name="bio" placeholder="Your Bio" onChange={handleChange}></textarea>
      <input name="avatar" placeholder="Avatar URL" onChange={handleChange} />
      <input name="level" placeholder="Level" onChange={handleChange} />
      <button type="submit">Sign Up</button>
    </form>
  )
}
