"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Define types for our data
type Funeral = {
  id: string;
  deceased_name: string;
  funeral_date: string;
  image_url: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | null;
};

type Stats = {
  totalFunerals: number;
  totalViews: number; // Placeholder
  totalCondolences: number; // Placeholder
  totalDonations: number; // Placeholder
  monthlyGrowth: number; // Placeholder
};

type UserProfile = {
  full_name: string;
  // Add other profile fields
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [funerals, setFunerals] = useState<Funeral[]>([]);
  const [stats, setStats] = useState<Stats>({ totalFunerals: 0, totalViews: 0, totalCondolences: 0, totalDonations: 0, monthlyGrowth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for success message in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message');
    
    if (status === 'success' && message) {
      setSuccessMessage(decodeURIComponent(message));
      
      // Clear the URL parameters after reading them
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authUser.id)
        .single();
      setUser(profileData);

      // Fetch funerals for the user
      const { data: funeralsData, error } = await supabase
        .from('funerals')
        .select('*')
        .eq('user_id', authUser.id);

      if (funeralsData) {
        setFunerals(funeralsData);
        // Basic stats calculation (can be expanded)
        setStats({
          totalFunerals: funeralsData.length,
          totalViews: 0, // Replace with actual data later
          totalCondolences: 0, // Replace with actual data later
          totalDonations: 0, // Replace with actual data later
          monthlyGrowth: 0, // Replace with actual data later
        });
      }

      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Success Message */}
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-green-100 border border-green-200 text-green-800 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                <p>{successMessage}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSuccessMessage(null)}
                className="text-green-700 hover:bg-green-200"
              >
                ×
              </Button>
            </motion.div>
          )}
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.full_name || 'User'}
              </h1>
              <p className="text-xl text-slate-600">
                Manage your funeral listings and connect with your community
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-white/80"
              >
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
                    <p className="text-sm text-slate-600 font-medium">
                      Total Funerals
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {isLoading ? '...' : stats.totalFunerals}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        +{stats.monthlyGrowth}%
                      </span>
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
                    <p className="text-sm text-slate-600 font-medium">
                      Total Views
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {isLoading ? '...' : stats.totalViews.toLocaleString()}
                    </p>
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
                    <p className="text-sm text-slate-600 font-medium">
                      Condolences
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {isLoading ? '...' : stats.totalCondolences}
                    </p>
                    <div className="flex items-center mt-2">
                      <Heart className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-sm text-slate-600">
                        Messages received
                      </span>
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
                    <p className="text-sm text-slate-600 font-medium">
                      Donations (GHS)
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {isLoading ? "..." : stats.totalDonations.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <DollarSign className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-slate-600">
                        Total raised
                      </span>
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-200/80 rounded-xl mb-8">
                <TabsTrigger value="all" className="rounded-lg">
                  All Funerals
                </TabsTrigger>
                <TabsTrigger value="drafts" className="rounded-lg">
                  Drafts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {isLoading ? (
                  <div className="text-center py-16">Loading your funerals...</div>
                ) : funerals.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-slate-600 mb-4">
                      You haven't created any funerals yet.
                    </p>
                    <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl">
                      <Link href="/create-funeral">Create Your First Funeral</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {funerals.map((funeral) => (
                      <motion.div
                        key={funeral.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                          <div className="relative">
                            <img
                              src={funeral.image_url || "/placeholder.svg"}
                              alt={funeral.deceased_name}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg font-bold">{funeral.deceased_name}</CardTitle>
                                <CardDescription>Created on {new Date(funeral.created_at).toLocaleDateString()}</CardDescription>
                              </div>
                              <Badge 
                                className={`${{
                                  approved: 'bg-green-500',
                                  pending: 'bg-yellow-500',
                                  rejected: 'bg-red-500',
                                }[funeral.status || 'pending']} text-white`}>
                                {funeral.status ? funeral.status.charAt(0).toUpperCase() + funeral.status.slice(1) : 'Pending'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center text-slate-600 text-sm mb-4">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{new Date(funeral.funeral_date).toDateString()}</span>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className={funeral.status !== 'approved' ? 'cursor-not-allowed' : ''}>
                              <Button asChild variant="ghost" disabled={funeral.status !== 'approved'} className="w-full justify-start">
                                <Link href={`/funeral/${funeral.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Link>
                              </Button>
                            </div>
                            <Button asChild variant="outline">
                              <Link href={`/edit-funeral/${funeral.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </Button>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts">
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Drafts
                  </h3>
                  <p className="text-slate-600">
                    You currently have no funerals saved as drafts.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
