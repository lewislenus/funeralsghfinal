"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send, Heart } from "lucide-react"
import { motion } from "framer-motion"

interface GuestbookFormProps {
  funeralId: string
  onSubmitted?: () => void
}

export function GuestbookForm({ funeralId, onSubmitted }: GuestbookFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/condolences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funeral_id: funeralId,
          author_name: formData.name,
          author_email: formData.email || null,
          message: formData.message,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit condolence")
      }

      // Reset form and show success
      setFormData({ name: "", email: "", location: "", message: "" })
      setSubmitted(true)

      // Trigger parent refresh
      if (typeof onSubmitted === 'function') {
        onSubmitted();
      }

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit condolence. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (submitted) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Thank You</h3>
          <p className="text-slate-600">
            Your condolence message has been submitted and will be reviewed before being published.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg">
        <CardTitle className="flex items-center text-xl text-slate-800">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mr-3">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          Leave a Condolence Message
        </CardTitle>
        <p className="text-slate-600 mt-2">Share your memories, condolences, or words of comfort with the family</p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-slate-700 font-medium">
                Your Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email (Optional)
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="text-slate-700 font-medium">
              Location (Optional)
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-slate-700 font-medium">
              Your Message *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Share your memories, condolences, or words of comfort..."
              rows={5}
              className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 resize-none"
              required
            />
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.message}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Condolence
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Your message matters</p>
              <p className="text-xs text-slate-600 mt-1">
                Your message will be reviewed before being published. Please be respectful and considerate in your
                words.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
