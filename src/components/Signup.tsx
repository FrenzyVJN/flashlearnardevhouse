import { useState } from 'react'

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
  
    const newUser = { ...form  }
    console.log(newUser);
  
    try {
      console.log("try entered")
      const res = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
  
      console.log(data)
      localStorage.setItem("currentUser", JSON.stringify(data.user))
    } catch (err: any) {
      alert("Error: " + err.message)
    }
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
