"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  FileText,
  Heart,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Sample organiser data
const sampleData = {
  funerals: [
    {
      id: "1",
      deceased: "Kwame Asante",
      date: "2024-01-20",
      status: "upcoming",
      views: 245,
      condolences: 12,
      donations: 5420,
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "2",
      deceased: "Akosua Mensah",
      date: "2024-01-18",
      status: "upcoming",
      views: 189,
      condolences: 8,
      donations: 3200,
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "3",
      deceased: "Kofi Boateng",
      date: "2024-01-15",
      status: "completed",
      views: 156,
      condolences: 15,
      donations: 2800,
      image: "/placeholder.svg?height=60&width=60",
    },
  ],
  stats: {
    totalFunerals: 3,
    totalViews: 590,
    totalCondolences: 35,
    totalDonations: 11420,
    monthlyGrowth: 12.5,
  },
  recentActivity: [
    { type: "condolence", message: "New condolence from Ama Osei", time: "2 hours ago" },
    { type: "donation", message: "₵200 donation received", time: "4 hours ago" },
    { type: "view", message: "50 new views on Kwame Asante's page", time: "6 hours ago" },
  ],
}

export default function DashboardPage() {
  const [funerals] = useState(sampleData.funerals)
  const [stats] = useState(sampleData.stats)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Welcome back, John
              </h1>
              <p className="text-xl text-slate-600">Manage your funeral listings and connect with your community</p>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="rounded-xl bg-white/80">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/create-funeral">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Funeral
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Funerals</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalFunerals}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Views</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalViews.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Eye className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-slate-600">This month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Condolences</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalCondolences}</p>
                    <div className="flex items-center mt-2">
                      <Heart className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-sm text-slate-600">Messages received</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Donations (GHS)</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">₵{stats.totalDonations.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <DollarSign className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-slate-600">Total raised</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-2">
                <TabsTrigger
                  value="overview"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="funerals"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My Funerals
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Clock className="w-5 h-5 mr-2 text-amber-600" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {sampleData.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  activity.type === "condolence"
                                    ? "bg-purple-500"
                                    : activity.type === "donation"
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-slate-800 font-medium">{activity.message}</p>
                                <p className="text-sm text-slate-500">{activity.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-xl">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          asChild
                          className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl"
                        >
                          <Link href="/create-funeral">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Funeral
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          View Messages
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <Settings className="w-4 h-4 mr-2" />
                          Account Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="funerals">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your Funeral Listings</CardTitle>
                    <p className="text-slate-600">Manage and monitor your funeral event pages</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {funerals.map((funeral) => (
                        <motion.div
                          key={funeral.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-6 border border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-6">
                            <img
                              src={funeral.image || "/placeholder.svg"}
                              alt={funeral.deceased}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold text-slate-800">{funeral.deceased}</h3>
                                <Badge
                                  className={`${
                                    funeral.status === "upcoming"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                                  } rounded-full`}
                                >
                                  {funeral.status === "upcoming" ? (
                                    <>
                                      <Calendar className="w-3 h-3 mr-1" />
                                      Upcoming
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Completed
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-slate-600 mb-3">
                                Funeral Date:{" "}
                                {new Date(funeral.date).toLocaleDateString("en-GB", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>

                              <div className="flex items-center space-x-8 text-sm text-slate-600">
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1 text-blue-500" />
                                  {funeral.views} views
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-1 text-purple-500" />
                                  {funeral.condolences} condolences
                                </span>
                                <span className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1 text-green-500" />₵
                                  {funeral.donations.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Button asChild variant="outline" size="sm" className="rounded-xl bg-transparent">
                              <Link href={`/funeral/${funeral.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-8 rounded-2xl text-center">
                          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
                          <p className="text-slate-600">
                            Comprehensive analytics including visitor demographics, engagement metrics, and donation
                            patterns would be displayed here.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Growth Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl text-center">
                          <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Monthly Growth</h3>
                          <p className="text-3xl font-bold text-green-600 mb-2">+{stats.monthlyGrowth}%</p>
                          <p className="text-slate-600">Increase in engagement this month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-8 rounded-2xl text-center">
                          <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Profile Management</h3>
                          <p className="text-slate-600">
                            Account management, notification preferences, and privacy settings would be available here.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div>
                            <p className="font-medium text-slate-800">Email Notifications</p>
                            <p className="text-sm text-slate-600">Receive updates via email</p>
                          </div>
                          <input type="checkbox" className="rounded border-slate-300 text-amber-600" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div>
                            <p className="font-medium text-slate-800">SMS Alerts</p>
                            <p className="text-sm text-slate-600">Get important updates via SMS</p>
                          </div>
                          <input type="checkbox" className="rounded border-slate-300 text-amber-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div>
                            <p className="font-medium text-slate-800">Push Notifications</p>
                            <p className="text-sm text-slate-600">Browser push notifications</p>
                          </div>
                          <input type="checkbox" className="rounded border-slate-300 text-amber-600" defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
