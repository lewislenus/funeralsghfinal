"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MessageCircle, DollarSign, Share2, Play, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Digital Brochures",
      description: "Interactive PDF flipbooks with zoom, fullscreen, and sharing capabilities",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MessageCircle,
      title: "Condolence Guestbook",
      description: "Allow visitors to leave heartfelt messages and memories without requiring login",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: DollarSign,
      title: "Secure Donations",
      description: "Accept support via Mobile Money and card payments with real-time tracking",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share funeral details via WhatsApp, Facebook, or direct links instantly",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Play,
      title: "Live Streaming",
      description: "Integrate YouTube or Facebook live streams for remote participation",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Bank-level security with content moderation and privacy controls",
      color: "from-slate-500 to-slate-600",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Everything You Need to Honor a Life</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools families need to create meaningful, accessible funeral
            experiences that bring communities together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                <CardContent className="p-8">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{feature.description}</p>
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:text-amber-600 p-0 h-auto font-medium group-hover:translate-x-2 transition-transform duration-200"
                  >
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Create a Memorial?</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join hundreds of families who have chosen our platform to honor their loved ones with dignity and respect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-amber-600 hover:bg-slate-50 rounded-xl px-8 py-4 font-semibold"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 rounded-xl px-8 py-4 bg-transparent"
              >
                View Demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
