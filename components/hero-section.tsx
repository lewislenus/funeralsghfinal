"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Shield, Play, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
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

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
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
                Trusted by 500+ Ghanaian Families
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                >
                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                    Honor Lives,
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                    Share Memories
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl"
                >
                  Ghana's premier digital platform connecting families and
                  communities to celebrate lives, share condolences, and provide
                  meaningful support during times of loss.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white rounded-2xl px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
                >
                  <Link href="/funerals">
                    Browse Funerals
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-2xl px-10 py-6 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/about" className="flex items-center">
                    <Play className="w-5 h-5 mr-3" />
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-200"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 mb-2">
                    500+
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    Families Served
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 mb-2">
                    10K+
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    Condolences Shared
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 mb-2">
                    ₵50K+
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    Support Raised
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10">
                {/* Main Demo Card */}
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-slate-100"
                >
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <Image
                        src="/funeral1.jpg"
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full border-3 border-white flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        Kwame Asante
                      </h3>
                      <p className="text-slate-600 text-lg">1945 - 2024</p>
                      <p className="text-amber-600 font-semibold">
                        Beloved Teacher & Leader
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-8 leading-relaxed">
                    A dedicated educator who touched thousands of lives across
                    Ghana. His legacy of wisdom and compassion continues to
                    inspire...
                  </p>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">23 condolences</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-medium">₵5,420 raised</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl py-3 font-semibold">
                    View Memorial
                  </Button>
                </motion.div>

                {/* Floating Feature Cards */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 w-64 border border-slate-100"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-6 h-6 text-green-500" />
                    <span className="font-semibold text-slate-700">
                      Secure & Private
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Bank-level security protects your donations and personal
                    messages.
                  </p>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 8, 0],
                    rotate: [0, -1, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-6 -left-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-xl p-6 w-56"
                >
                  <div className="text-2xl font-bold mb-2">24/7</div>
                  <p className="text-amber-100 font-medium">
                    Support Available
                  </p>
                  <p className="text-sm text-amber-200 mt-2">
                    Always here when families need us most
                  </p>
                </motion.div>
              </div>

              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-200 to-red-200 rounded-[3rem] transform rotate-3 scale-105 opacity-20 blur-sm"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
