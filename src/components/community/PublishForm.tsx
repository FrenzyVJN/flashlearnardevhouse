"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Share2, Image, Tag, FileText, Bookmark } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function ProjectPublishForm() {
  const [form, setForm] = useState({
    name: "",
    avatar: "",
    level: "",
    title: "",
    content: "",
    image: "",
    projectName: "",
    tags: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const local = localStorage.getItem("currentUser")
      if (!local) {
        alert("You need to be signed in!")
        setIsSubmitting(false)
        return
      }

      const user = JSON.parse(local)
      const payload = {
        user: {
          name: user.name,
          avatar: user.avatar,
          level: user.level,
        },
        title: form.title,
        content: form.content,
        image: form.image,
        projectName: form.projectName,
        tags: form.tags.split(",").map((t) => t.trim()),
      }

      const res = await fetch("http://localhost:8000/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log("Uploaded:", data)

      setForm({
        name: "",
        avatar: "",
        level: "",
        title: "",
        content: "",
        image: "",
        projectName: "",
        tags: "",
      })
    } catch (error) {
      console.error("Error submitting project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-xl mx-auto border-blue-700 bg-slate-900 text-slate-100 shadow-xl shadow-blue-900/20">
      <CardHeader className="space-y-1 border-b border-blue-800/30 pb-6">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-2xl font-bold text-white">Share a Project</CardTitle>
        </div>
        <CardDescription className="text-slate-400">Share your latest project with the community</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Post Title
            </Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              placeholder="Enter a catchy title"
              onChange={handleChange}
              className="border-blue-800/50 bg-slate-800/50 text-slate-100 focus-visible:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Description
            </Label>
            <Textarea
              id="content"
              name="content"
              value={form.content}
              placeholder="What did you do? Share the details of your project..."
              onChange={handleChange}
              className="min-h-[120px] border-blue-800/50 bg-slate-800/50 text-slate-100 focus-visible:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Image className="h-4 w-4 text-blue-400" />
              Image URL
            </Label>
            <Input
              id="image"
              name="image"
              value={form.image}
              placeholder="Add a screenshot or preview image URL"
              onChange={handleChange}
              className="border-blue-800/50 bg-slate-800/50 text-slate-100 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-blue-400" />
              Project Name
            </Label>
            <Input
              id="projectName"
              name="projectName"
              value={form.projectName}
              placeholder="What's your project called?"
              onChange={handleChange}
              className="border-blue-800/50 bg-slate-800/50 text-slate-100 focus-visible:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-400" />
              Tags
            </Label>
            <Input
              id="tags"
              name="tags"
              value={form.tags}
              placeholder="react, nextjs, tailwind (comma separated)"
              onChange={handleChange}
              className="border-blue-800/50 bg-slate-800/50 text-slate-100 focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>

        <CardFooter className="border-t border-blue-800/30 pt-6">
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Share Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}