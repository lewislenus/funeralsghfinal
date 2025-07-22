"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Calendar, Image, Info, User, FileText } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function CreateFuneralPage() {
  const [formData, setFormData] = useState({
    deceased_name: "",
    date_of_birth: "",
    date_of_death: "",
    funeral_date: "",
    funeral_location: "",
    life_story: "",
    image_url: "",
    organized_by: "",
    livestream_url: "",
    brochure_url: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create a funeral.")
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from("funerals").insert([{
      ...formData,
      user_id: user.id,
      status: 'pending', // Set status to pending for admin approval
    }])

    if (error) {
      setError(error.message)
    } else {
      // Redirect to dashboard with success message
      router.push("/dashboard?status=success&message=Funeral+entry+created+successfully.+It+is+now+pending+approval+by+an+administrator.")
    }

    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-8">
              <Link href="/dashboard" className="flex items-center text-slate-600 hover:text-amber-600 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>

            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-slate-800">Create a New Funeral Page</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="p-4 mb-4 bg-red-100 text-red-800 rounded-lg text-center">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Deceased Name */}
                  <div className="space-y-2">
                    <Label htmlFor="deceased_name">Deceased's Full Name</Label>
                    <Input id="deceased_name" name="deceased_name" value={formData.deceased_name} onChange={handleChange} required />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_death">Date of Death</Label>
                      <Input id="date_of_death" name="date_of_death" type="date" value={formData.date_of_death} onChange={handleChange} required />
                    </div>
                  </div>

                  {/* Funeral Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="funeral_date">Funeral Date & Time</Label>
                      <Input id="funeral_date" name="funeral_date" type="datetime-local" value={formData.funeral_date} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="funeral_location">Funeral Location</Label>
                      <Input id="funeral_location" name="funeral_location" value={formData.funeral_location} onChange={handleChange} required />
                    </div>
                  </div>

                  {/* Life Story */}
                  <div className="space-y-2">
                    <Label htmlFor="life_story">Life Story</Label>
                    <Textarea id="life_story" name="life_story" value={formData.life_story} onChange={handleChange} rows={6} />
                  </div>

                  {/* Organizer */}
                  <div className="space-y-2">
                    <Label htmlFor="organized_by">Organized By</Label>
                    <Input id="organized_by" name="organized_by" value={formData.organized_by} onChange={handleChange} placeholder="e.g., The Mensah Family" />
                  </div>

                  {/* Funeral Brochure URL */}
                  <div className="space-y-2">
                    <Label htmlFor="brochure_url">Funeral Brochure URL</Label>
                    <Input id="brochure_url" name="brochure_url" value={formData.brochure_url} onChange={handleChange} placeholder="https://example.com/brochure.pdf" />
                  </div>

                  {/* Livestream URL */}
                  <div className="space-y-2">
                    <Label htmlFor="livestream_url">Livestream URL</Label>
                    <Input id="livestream_url" name="livestream_url" value={formData.livestream_url} onChange={handleChange} placeholder="https://example.com/livestream" />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Cover Image URL</Label>
                    <Input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Creating..." : "Create Funeral Page"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
