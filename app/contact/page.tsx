"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Heart, Users } from "lucide-react"
import { motion } from "framer-motion"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log("Contact form submitted:", formData)
    setIsSubmitting(false)
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: ""
    })
    
    alert("Thank you for your message. We'll get back to you within 24 hours.")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "support@funeralsghana.com",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+233 (0) 24 123 4567",
      description: "Mon-Fri 8AM-6PM, Sat 9AM-4PM"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Accra, Ghana",
      description: "East Legon, Accra"
    },
    {
      icon: Clock,
      title: "Support Hours",
      details: "24/7 Emergency Support",
      description: "Always here when you need us"
    }
  ]

  const faqs = [
    {
      question: "How do I create a funeral page?",
      answer: "Simply sign up for an account, then use our intuitive dashboard to create a beautiful funeral page with photos, biography, and service details."
    },
    {
      question: "Is the platform free to use?",
      answer: "Yes, basic funeral pages are completely free. We offer premium features for enhanced customization and additional services."
    },
    {
      question: "How secure are donations?",
      answer: "All donations are processed through secure, encrypted payment gateways. We use bank-level security to protect all transactions."
    },
    {
      question: "Can I moderate condolence messages?",
      answer: "Yes, as a funeral organizer, you have full control to moderate and approve condolence messages before they appear publicly."
    }
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-600/20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center text-white"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Get in <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8">
                We're here to support you during difficult times. Reach out to us anytime 
                for assistance, questions, or just to talk.
              </p>
              <div className="flex items-center justify-center space-x-8 text-slate-300">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span>Compassionate Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>24/7 Availability</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <info.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{info.title}</h3>
                      <p className="text-lg font-semibold text-amber-600 mb-2">{info.details}</p>
                      <p className="text-slate-600">{info.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Contact Form */}
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-slate-800 mb-2">Send us a Message</CardTitle>
                    <p className="text-slate-600">We'll respond within 24 hours</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-slate-700 font-medium">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-slate-700 font-medium">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+233 XX XXX XXXX"
                            className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inquiryType" className="text-slate-700 font-medium">Inquiry Type</Label>
                          <Select value={formData.inquiryType} onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}>
                            <SelectTrigger className="mt-2 rounded-xl border-slate-300">
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="support">Technical Support</SelectItem>
                              <SelectItem value="billing">Billing Question</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-slate-700 font-medium">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Subject of your inquiry"
                          className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-slate-700 font-medium">Message *</Label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="mt-2 w-full rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 p-3"
                          placeholder="Type your message here..."
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-60"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Add other content here if needed */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
