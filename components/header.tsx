"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, User, Plus, Menu, X, Bell } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                damarifadue
              </span>
              <p className="text-xs text-slate-500 -mt-1 font-medium">Honoring Lives with Dignity</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-slate-700 hover:text-amber-600 transition-colors duration-200 font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              href="/funerals"
              className="text-slate-700 hover:text-amber-600 transition-colors duration-200 font-medium relative group"
            >
              Browse Funerals
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              href="/about"
              className="text-slate-700 hover:text-amber-600 transition-colors duration-200 font-medium relative group"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="text-slate-700 hover:text-amber-600 transition-colors duration-200 font-medium relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
              <Input
                placeholder="Search funerals, families, or locations..."
                className="pl-12 pr-4 py-3 bg-slate-50/80 border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 rounded-xl px-6 bg-transparent shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Link href="/dashboard">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Funeral
                  </Link>
                </Button>
                <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 rounded-xl px-6">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-700 hover:bg-slate-100 rounded-xl px-6 font-medium"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 pb-4 border-t border-slate-200"
          >
            <div className="flex flex-col space-y-4 pt-4">
              <div className="md:hidden">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Search..." className="pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl" />
                </div>
              </div>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-slate-700 hover:text-amber-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Home
                </Link>
                <Link
                  href="/funerals"
                  className="text-slate-700 hover:text-amber-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Browse Funerals
                </Link>
                <Link
                  href="/about"
                  className="text-slate-700 hover:text-amber-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-slate-700 hover:text-amber-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Contact
                </Link>
              </nav>
              <div className="flex flex-col space-y-3 pt-4 border-t border-slate-200">
                {isLoggedIn ? (
                  <>
                    <Button asChild variant="outline" className="justify-start rounded-xl bg-transparent">
                      <Link href="/dashboard">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Funeral
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start rounded-xl">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="justify-start rounded-xl">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-amber-500 to-red-600 rounded-xl">
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
