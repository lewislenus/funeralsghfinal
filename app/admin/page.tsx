"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Shield,
  Users,
  FileText,
  MessageCircle,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react"
import { motion } from "framer-motion"

// Sample admin data
const adminData = {
  stats: {
    totalUsers: 1250,
    pendingFunerals: 8,
    totalFunerals: 156,
    flaggedContent: 3,
    totalDonations: 125000,
    monthlyGrowth: 18.5,
  },
  pendingFunerals: [
    {
      id: "1",
      deceased: "Ama Osei",
      organizer: "Kofi Osei",
      date: "2024-02-15",
      status: "pending",
      submittedAt: "2024-01-10T10:30:00Z",
    },
    {
      id: "2",
      deceased: "Yaw Mensah",
      organizer: "Akosua Mensah",
      date: "2024-02-20",
      status: "pending",
      submittedAt: "2024-01-11T14:20:00Z",
    },
  ],
  flaggedContent: [
    {
      id: "1",
      type: "condolence",
      content: "Inappropriate message content...",
      reporter: "Anonymous",
      funeral: "Kwame Asante",
      reportedAt: "2024-01-12T09:15:00Z",
    },
  ],
  recentActivity: [
    { type: "approval", message: "Funeral for Akua Boateng approved", time: "1 hour ago" },
    { type: "flag", message: "Content flagged for review", time: "3 hours ago" },
    { type: "user", message: "New user registration: John Doe", time: "5 hours ago" },
  ],
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const handleApproveFuneral = (id: string) => {
    console.log("Approving funeral:", id)
    // Implementation would go here
  }

  const handleRejectFuneral = (id: string) => {
    console.log("Rejecting funeral:", id)
    // Implementation would go here
  }

  const handleResolveFlag = (id: string) => {
    console.log("Resolving flag:", id)
    // Implementation would go here
  }

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
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-xl text-slate-600">Monitor platform activity and manage content</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search users, funerals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 w-64"
                />
              </div>
              <Button variant="outline" className="rounded-xl bg-white/80">
                <Filter className="w-4 h-4 mr-2" />
                Filters
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
                    <p className="text-sm text-slate-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {adminData.stats.totalUsers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+{adminData.stats.monthlyGrowth}%</span>
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
                    <p className="text-sm text-slate-600 font-medium">Pending Reviews</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{adminData.stats.pendingFunerals}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-slate-600">Awaiting approval</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Flagged Content</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{adminData.stats.flaggedContent}</p>
                    <div className="flex items-center mt-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-slate-600">Needs attention</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Donations</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      ₵{adminData.stats.totalDonations.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-slate-600">Platform total</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-2">
                <TabsTrigger
                  value="overview"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-medium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="funerals"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-medium"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Funerals
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-medium"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="donations"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-medium"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Donations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Clock className="w-5 h-5 mr-2 text-red-600" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {adminData.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  activity.type === "approval"
                                    ? "bg-green-500"
                                    : activity.type === "flag"
                                      ? "bg-red-500"
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
                        <Button className="w-full justify-start bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Review Flagged Content
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Approve Funerals
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <Users className="w-4 h-4 mr-2" />
                          Manage Users
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Reports
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="funerals">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Pending Funeral Approvals</CardTitle>
                    <p className="text-slate-600">Review and approve funeral listings</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {adminData.pendingFunerals.map((funeral) => (
                        <motion.div
                          key={funeral.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-6 border border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-all duration-300"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-slate-800">{funeral.deceased}</h3>
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-full">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending Review
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-2">
                              Organizer: <span className="font-medium">{funeral.organizer}</span>
                            </p>
                            <p className="text-slate-600 mb-2">
                              Funeral Date:{" "}
                              {new Date(funeral.date).toLocaleDateString("en-GB", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-slate-500">
                              Submitted: {new Date(funeral.submittedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                            <Button
                              onClick={() => handleApproveFuneral(funeral.id)}
                              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectFuneral(funeral.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl bg-transparent"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">User Management</CardTitle>
                    <p className="text-slate-600">Monitor and manage platform users</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-12 rounded-2xl text-center">
                      <Users className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">User Management Dashboard</h3>
                      <p className="text-slate-600 text-lg">
                        Comprehensive user management tools including user profiles, activity monitoring, and account
                        management would be implemented here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Flagged Content Review</CardTitle>
                    <p className="text-slate-600">Review and moderate reported content</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {adminData.flaggedContent.map((flag) => (
                        <motion.div
                          key={flag.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-start justify-between p-6 border border-red-200 rounded-2xl bg-red-50/50 hover:bg-red-50/80 transition-all duration-300"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 rounded-full">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {flag.type}
                              </Badge>
                              <span className="text-slate-600">on {flag.funeral}</span>
                            </div>
                            <p className="text-slate-800 mb-3 font-medium">{flag.content}</p>
                            <div className="text-sm text-slate-600">
                              <p>Reported by: {flag.reporter}</p>
                              <p>Date: {new Date(flag.reportedAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm" className="rounded-xl bg-white">
                              <Eye className="w-4 h-4 mr-2" />
                              View Full
                            </Button>
                            <Button
                              onClick={() => handleResolveFlag(flag.id)}
                              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl bg-white"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="donations">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Donations Dashboard</CardTitle>
                    <p className="text-slate-600">Monitor platform donation activity</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-12 rounded-2xl text-center">
                      <DollarSign className="w-16 h-16 text-green-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">Donations Analytics</h3>
                      <div className="text-4xl font-bold text-green-600 mb-4">
                        ₵{adminData.stats.totalDonations.toLocaleString()}
                      </div>
                      <p className="text-slate-600 text-lg">
                        Detailed donation analytics, transaction monitoring, and financial reporting tools would be
                        implemented here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
