"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FuneralCard } from "@/components/funeral-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Filter, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import type { FuneralWithStats } from "@/lib/api/funerals"

interface FuneralFilters {
  search: string
  region: string
  status: "upcoming" | "past" | "all"
  dateRange: "week" | "month" | "all"
  sortBy: "date" | "name" | "recent" | "popular"
}

export default function FuneralsPage() {
  const [funerals, setFunerals] = useState<FuneralWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Filter states
  const [filters, setFilters] = useState<FuneralFilters>({
    search: "",
    region: "all",
    status: "all",
    dateRange: "all",
    sortBy: "date",
  })

  const regions = [
    "Greater Accra",
    "Ashanti",
    "Northern",
    "Western",
    "Eastern",
    "Central",
    "Volta",
    "Upper East",
    "Upper West",
    "Brong Ahafo",
    "North East",
    "Savannah",
    "Oti",
    "Ahafo",
    "Bono East",
    "Western North",
  ]

  // Fetch funerals from API
  const fetchFunerals = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)
      if (filters.region !== "all") params.append("region", filters.region)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.dateRange !== "all") params.append("dateRange", filters.dateRange)
      params.append("sortBy", filters.sortBy)

      const response = await fetch(`/api/funerals?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch funerals")
      }

      setFunerals(result.data || [])
      setTotalCount(result.count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Fetch funerals when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFunerals()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [filters])

  const handleFilterChange = (key: keyof FuneralFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      region: "all",
      status: "all",
      dateRange: "all",
      sortBy: "date",
    })
  }

  const hasActiveFilters =
    filters.search || filters.region !== "all" || filters.status !== "all" || filters.dateRange !== "all"

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Loading Funerals</h2>
              <p className="text-slate-600">Please wait while we fetch the latest funeral listings...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Unable to Load Funerals</h2>
              <p className="text-lg text-slate-600 mb-8 text-center max-w-md">{error}</p>
              <Button
                onClick={fetchFunerals}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl px-8"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              Browse Funeral Services
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Connect with funeral services across Ghana. Leave condolences, share memories, and show support to
              grieving families.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{funerals.filter((f) => new Date(f.funeral_date) >= new Date()).length} Upcoming Services</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{totalCount} Total Listings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>{new Set(funerals.map((f) => f.region)).size} Regions Covered</span>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Filter className="w-5 h-5 mr-2 text-amber-600" />
                  Filter & Search Funerals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Bar */}
                <div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search by name, family, location, or venue..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-12 pr-4 py-3 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 text-lg"
                    />
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Region Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Region</label>
                    <Select value={filters.region} onValueChange={(value) => handleFilterChange("region", value)}>
                      <SelectTrigger className="rounded-xl border-slate-300">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                    <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                      <SelectTrigger className="rounded-xl border-slate-300">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Funeral Date</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="recent">Recently Added</SelectItem>
                        <SelectItem value="popular">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
                    <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                      <SelectTrigger className="rounded-xl border-slate-300">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Next Week</SelectItem>
                        <SelectItem value="month">Next Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                      <SelectTrigger className="rounded-xl border-slate-300">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="upcoming">Upcoming Only</SelectItem>
                        <SelectItem value="past">Past Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <Badge variant="outline" className="text-slate-600">
                      {funerals.length} of {totalCount} funerals
                    </Badge>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          {funerals.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">No funerals found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                We couldn't find any funerals matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <Button onClick={clearFilters} variant="outline" className="rounded-xl bg-white/80">
                Clear All Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {funerals.map((funeral, index) => (
                <motion.div
                  key={funeral.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <FuneralCard
                    funeral={{
                      id: funeral.id,
                      deceased: {
                        name: funeral.deceased_name,
                        photo: funeral.deceased_photo_url || "/placeholder.svg?height=200&width=200",
                        dob: funeral.date_of_birth,
                        dod: funeral.date_of_death,
                        biography: funeral.biography || "",
                      },
                      funeral: {
                        date: funeral.funeral_date,
                        time: funeral.funeral_time,
                        venue: funeral.venue,
                        region: funeral.region,
                        location: funeral.location,
                      },
                      family: funeral.family_name,
                      poster: funeral.poster_url || "/placeholder.svg?height=400&width=300",
                      livestream: funeral.livestream_url,
                      isUpcoming: new Date(funeral.funeral_date) >= new Date(),
                      condolences: funeral.condolences_count,
                      donations: funeral.donations_total,
                      views: funeral.views_count,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
