import { useState } from 'react'
import users from '../data/users.json'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    const data = JSON.parse(localStorage.getItem("users") || "[]")
    const user = data.find((u: any) => u.username === username && u.password === password)
    if (user) {
      alert("Login successful!")
      localStorage.setItem("currentUser", JSON.stringify(user))
    } else {
      alert("Invalid credentials.")
    }
  }

  return (
    <div>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
