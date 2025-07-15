"use client"

import { useState } from "react"
import { FuneralCard } from "./funeral-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Sample funeral data for homepage preview
const sampleFunerals = [
  {
    id: "1",
    deceased: {
      name: "Kwame Asante",
      photo: "/placeholder.svg?height=200&width=200",
      dob: "1945-03-15",
      dod: "2024-01-10",
      biography: "A beloved teacher and community leader who dedicated his life to education in Kumasi.",
    },
    funeral: {
      date: "2024-01-20",
      time: "09:00",
      venue: "St. Peter's Cathedral",
      region: "Ashanti",
      location: "Kumasi, Ghana",
    },
    family: "Asante Family",
    poster: "/placeholder.svg?height=400&width=300",
    livestream: "https://youtube.com/watch?v=example",
    isUpcoming: true,
    condolences: 23,
    donations: 5420,
    views: 245,
  },
  {
    id: "2",
    deceased: {
      name: "Akosua Mensah",
      photo: "/placeholder.svg?height=200&width=200",
      dob: "1960-07-22",
      dod: "2024-01-08",
      biography: "A successful businesswoman and mother who touched many lives in Accra.",
    },
    funeral: {
      date: "2024-01-18",
      time: "10:00",
      venue: "Holy Trinity Cathedral",
      region: "Greater Accra",
      location: "Accra, Ghana",
    },
    family: "Mensah Family",
    poster: "/placeholder.svg?height=400&width=300",
    livestream: "https://facebook.com/watch?v=example",
    isUpcoming: true,
    condolences: 18,
    donations: 3200,
    views: 189,
  },
  {
    id: "3",
    deceased: {
      name: "Kofi Boateng",
      photo: "/placeholder.svg?height=200&width=200",
      dob: "1938-11-05",
      dod: "2024-01-05",
      biography: "A respected elder and traditional leader from the Northern Region.",
    },
    funeral: {
      date: "2024-01-15",
      time: "08:00",
      venue: "Tamale Central Mosque",
      region: "Northern",
      location: "Tamale, Ghana",
    },
    family: "Boateng Family",
    poster: "/placeholder.svg?height=400&width=300",
    livestream: null,
    isUpcoming: false,
    condolences: 15,
    donations: 2800,
    views: 156,
  },
]

export function FuneralDirectory() {
  const [funerals] = useState(sampleFunerals)

  return (
    <section className="py-20 bg-gradient-to-br from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Recent Funeral Services</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Browse and connect with funeral services across Ghana. Leave condolences, share memories, and show support.
          </p>

          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Link href="/funerals">
              View All Funerals
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </motion.div>

        {/* Funeral Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {funerals.map((funeral, index) => (
            <motion.div
              key={funeral.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <FuneralCard funeral={funeral} />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Need to Create a Memorial?</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Honor your loved one with a beautiful, dignified memorial page that brings family and friends together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl px-8 py-4 font-semibold"
              >
                <Link href="/signup">Create Memorial</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 rounded-xl px-8 py-4 font-semibold bg-transparent"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
