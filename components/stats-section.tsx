"use client"

import { Heart, Users, MapPin, Clock } from "lucide-react"
import { motion } from "framer-motion"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Families Served",
      description: "Across communities worldwide",
    },
    {
      icon: Heart,
      value: "10K+",
      label: "Condolences Shared",
      description: "Messages of love and support",
    },
    {
      icon: MapPin,
      value: "Global",
      label: "Reach",
      description: "Supporting families everywhere",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Always Available",
      description: "Support when you need it most",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-600/20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Families Worldwide</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Our platform has become the go-to resource for honoring loved ones and supporting families during their time
            of need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-6 group-hover:shadow-lg transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-amber-300 mb-2">{stat.label}</div>
                <p className="text-slate-300 text-sm">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
