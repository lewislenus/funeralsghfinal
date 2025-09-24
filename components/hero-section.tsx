"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Shield, Play, Star, Plus } from "lucide-react";
import Marquee from "react-fast-marquee";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { TypewriterText } from "./typewriter-text";

export function HeroSection() {
  const headerTexts = [
    "Honor Lives,\nShare Memories",
    "Celebrate Memories,\nShare Stories", 
    "Preserve Legacies,\nShare Love",
    "Remember Heroes,\nShare Tributes",
    "Cherish Moments,\nShare Condolences",
    "Honor Ancestors,\nShare Support",
    "Treasure Lives,\nShare Hope"
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-100/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-gradient-to-tr from-orange-100/30 to-transparent"></div>

        {/* Floating Geometric Shapes */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-300 rounded-3xl opacity-30"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-40 left-16 w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full opacity-40"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-30">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-semibold shadow-sm"
              >
                <Star className="w-4 h-4 mr-2 text-amber-600" />
                Trusted by 500+ Families Worldwide
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                >
                  <TypewriterText 
                    texts={headerTexts}
                    typeSpeed={80}
                    deleteSpeed={50}
                    pauseDuration={3000}
                    className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent"
                  />
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl"
                >
                  A premier digital platform connecting families and
                  communities to celebrate lives, share condolences, and provide
                  meaningful support during times of loss.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-6 relative z-20"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white rounded-2xl px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 relative z-30"
                >
                  <Link href="/funerals" className="flex items-center justify-center">
                    Browse Funerals
                    <ArrowRight className="w-6 h-6 ml-3 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-2xl px-10 py-6 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 relative z-30"
                >
                  <Link href="/signup" className="flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-3" />
                    Create Funeral
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Scrolling Images */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <Marquee pauseOnHover={true} speed={40} gradient={false}>
                <div className="flex space-x-6 py-4">
                  {[
                    "/funeral1.jpg",
                    "/funeral2.jpg",
                    "/funeral3.jpg",
                    "/funeral4.jpg",
                    "/funeral5.jpg",
                  ].map((src, index) => (
                    <div key={index} className="w-80 h-[480px] flex-shrink-0">
                      <Image
                        src={src}
                        alt={`Funeral scene ${index + 1}`}
                        width={320}
                        height={480}
                        priority={index === 0}
                        sizes="(max-width: 768px) 70vw, 320px"
                        className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white"
                      />
                    </div>
                  ))}
                </div>
              </Marquee>
            </div>

            {/* Background Decoration */}
            {/* Removed potentially interfering background decoration */}
          </div>
        </div>
      </div>
    </section>
  );
}
