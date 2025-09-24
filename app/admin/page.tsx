"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AdminBrochureUpload } from "@/components/admin-brochure-upload";
import { toast } from "@/components/ui/use-toast";
import {
  Shield,
  Users,
  FileText,
  MessageCircle,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
  Upload,
  BookOpen,
  Plus,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type PendingFuneral = {
  id: string;
  user_id: string | null;
  deceased_name: string;
  created_at: string;
  donations_total: number;
  donations_count: number;
  organizer: string;
  funeral_date?: string | null;
  status: string;
  featured: boolean;
  is_visible?: boolean;
};

export default function AdminDashboard() {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Date not set";
    }
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingFunerals, setPendingFunerals] = useState<PendingFuneral[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFuneralForBrochure, setSelectedFuneralForBrochure] = useState<string | null>(null);
  const [funeralBrochures, setFuneralBrochures] = useState<Record<string, any[]>>({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFunerals: 0,
    flaggedContent: 0,
    totalDonations: 0,
    monthlyGrowth: 0,
  });
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Authentication error:", error.message);
          toast({
            title: "Authentication Error",
            description: "Please log in again.",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }
        
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access the admin dashboard.",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }
        
        if (user.email !== "funeralsghana@gmail.com") {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
          router.push("/");
          return;
        }
      } catch (err) {
        console.error("Admin check error:", err);
        router.push("/login");
      }
    };
    checkAdmin();
  }, [router, toast]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const { funeralsAPI } = await import("@/lib/api/funerals");
      const supabase = createClient();
      
      // Use the funeralsAPI to get admin funerals
      const { data: funerals, error: funeralsError } = await funeralsAPI.getAdminFunerals();

      // Fetch additional data in parallel
      const [usersResult, donationsResult, flaggedResult] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("donations").select("amount"),
        supabase
          .from("condolences")
          .select("id, message, author_name, funeral_id, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const users = usersResult.data;
      const donations = donationsResult.data;
      const flagged = flaggedResult.data;

      // Set funerals
      if (Array.isArray(funerals)) {
        const allFunerals = funerals.map((funeral) => ({
          id: funeral.id.toString(),
          user_id: funeral.user_id || "",
          deceased_name: funeral.deceased_name,
          created_at: funeral.created_at || new Date().toISOString(),
          funeral_date: funeral.funeral_date,
          organizer: funeral.family_name || "Not specified",
          donations_total: funeral.donations_total || 0,
          donations_count: funeral.donations_count || 0,
          status: funeral.status || "pending",
          featured: Boolean(funeral.featured || false),
          is_visible: Boolean(funeral.is_visible ?? true),
        }));
        setPendingFunerals(allFunerals);
        setPendingCount(
          allFunerals.filter((f) => f.status === "pending").length
        );
      }

      // Calculate stats
      setStats({
        totalUsers: users?.length || 0,
        totalFunerals: Array.isArray(funerals) ? funerals.length : 0,
        flaggedContent: flagged?.length || 0,
        totalDonations:
          donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
        monthlyGrowth: 0,
      });

      setFlaggedContent(flagged || []);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const handleApproveFuneral = async (id: string) => {
    try {
      const { funeralsAPI } = await import("@/lib/api/funerals");
      
      // Call the API to update the status to approved
      const { error } = await funeralsAPI.updateFuneral(id, { status: "approved" });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Funeral approved successfully.",
        variant: "default",
      });

      // Refresh the funeral data
      const { data: funerals } = await funeralsAPI.getAdminFunerals();

      if (Array.isArray(funerals)) {
        const allFunerals = funerals.map((funeral) => ({
          id: funeral.id.toString(),
          user_id: funeral.user_id || "",
          deceased_name: funeral.deceased_name,
          created_at: funeral.created_at || new Date().toISOString(),
          funeral_date: funeral.funeral_date,
          organizer: funeral.family_name || "Not specified",
          donations_total: funeral.donations_total || 0,
          donations_count: funeral.donations_count || 0,
          status: funeral.status || "pending",
          featured: Boolean(funeral.featured || false),
          is_visible: Boolean(funeral.is_visible ?? true),
        }));
        setPendingFunerals(allFunerals);
        setPendingCount(
          allFunerals.filter((f) => f.status === "pending").length
        );
      }
    } catch (error) {
      console.error("Error approving funeral:", error);
      toast({
        title: "Error",
        description: "Failed to approve funeral. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectFuneral = async (id: string) => {
    try {
      const { funeralsAPI } = await import("@/lib/api/funerals");
      
      // Call the API to update the status to rejected
      const { error } = await funeralsAPI.updateFuneral(id, { status: "rejected" });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Funeral rejected successfully.",
        variant: "default",
      });

      // Refresh the funeral data
      const { data: funerals } = await funeralsAPI.getAdminFunerals();

      if (Array.isArray(funerals)) {
        const allFunerals = funerals.map((funeral) => ({
          id: funeral.id.toString(),
          user_id: funeral.user_id || "",
          deceased_name: funeral.deceased_name,
          created_at: funeral.created_at || new Date().toISOString(),
          funeral_date: funeral.funeral_date,
          organizer: funeral.family_name || "Not specified",
          donations_total: funeral.donations_total || 0,
          donations_count: funeral.donations_count || 0,
          status: funeral.status || "pending",
          featured: Boolean(funeral.featured || false),
          is_visible: Boolean(funeral.is_visible ?? true),
        }));
        setPendingFunerals(allFunerals);
        setPendingCount(
          allFunerals.filter((f) => f.status === "pending").length
        );
      }
    } catch (error) {
      console.error("Error rejecting funeral:", error);
      toast({
        title: "Error",
        description: "Failed to reject funeral. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBrochureUpload = async (funeralId: string) => {
    setSelectedFuneralForBrochure(funeralId);
    
    // Load existing brochures for this funeral
    try {
      const { brochureAPI } = await import("@/lib/api/brochure");
      const { data: brochures, error } = await brochureAPI.getBrochuresForFuneral(funeralId);
      if (!error && brochures) {
        setFuneralBrochures(prev => ({ ...prev, [funeralId]: brochures }));
      }
    } catch (error) {
      console.error("Error loading brochures:", error);
    }
  };

  const handleBrochureUploadComplete = async () => {
    if (selectedFuneralForBrochure) {
      // Reload brochures for the selected funeral
      try {
        const { brochureAPI } = await import("@/lib/api/brochure");
        const { data: brochures, error } = await brochureAPI.getBrochuresForFuneral(selectedFuneralForBrochure);
        if (!error && brochures) {
          setFuneralBrochures(prev => ({ ...prev, [selectedFuneralForBrochure]: brochures }));
        }
      } catch (error) {
        console.error("Error reloading brochures:", error);
      }
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const newVisibility = !currentVisibility;
      
      // Call the API to update visibility
      const response = await fetch(`/api/funerals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: newVisibility }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update visibility');
      }

      toast({
        title: "Success",
        description: `Funeral ${newVisibility ? 'shown' : 'hidden'} successfully.`,
        variant: "default",
      });

      // Refresh the funeral data
      const { funeralsAPI } = await import("@/lib/api/funerals");
      const { data: funerals } = await funeralsAPI.getAdminFunerals();

      if (Array.isArray(funerals)) {
        const allFunerals = funerals.map((funeral) => ({
          id: funeral.id.toString(),
          user_id: funeral.user_id || "",
          deceased_name: funeral.deceased_name,
          created_at: funeral.created_at || new Date().toISOString(),
          funeral_date: funeral.funeral_date,
          organizer: funeral.family_name || "Not specified",
          donations_total: funeral.donations_total || 0,
          donations_count: funeral.donations_count || 0,
          status: funeral.status || "pending",
          featured: Boolean(funeral.featured || false),
          is_visible: Boolean(funeral.is_visible ?? true),
        }));
        setPendingFunerals(allFunerals);
        setPendingCount(
          allFunerals.filter((f) => f.status === "pending").length
        );
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Error",
        description: "Failed to toggle visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

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
              <p className="text-xl text-slate-600">
                Monitor platform activity and manage content
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search funerals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 w-64"
                />
              </div>
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
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {stats.totalUsers.toLocaleString()}
                    </p>
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
                      Pending Reviews
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {pendingCount}
                    </p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-slate-600">
                        Awaiting approval
                      </span>
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
                    <p className="text-sm text-slate-600 font-medium">
                      Total Funerals
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {stats.totalFunerals.toLocaleString()}
                    </p>
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
                    <p className="text-sm text-slate-600 font-medium">
                      Total Donations
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      ₵{stats.totalDonations.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Funerals List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Funeral Management</TabsTrigger>
                <TabsTrigger value="brochures">Brochure Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">All Funerals</CardTitle>
                    <p className="text-slate-600">
                      View and manage all funeral listings
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
                        </div>
                      ) : pendingFunerals.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-xl font-medium text-slate-600">
                            No funerals found
                          </h3>
                          <p className="text-slate-500 mt-2">
                            No funeral listings have been created yet.
                          </p>
                        </div>
                      ) : (
                        pendingFunerals.map((funeral) => (
                          <motion.div
                            key={funeral.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-6 border border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-all duration-300"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold text-slate-800">
                                  {funeral.deceased_name}
                                </h3>
                                <Badge
                                  className={`rounded-full ${
                                    funeral.status === "approved"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : funeral.status === "pending"
                                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                      : "bg-red-100 text-red-800 hover:bg-red-200"
                                  }`}
                                >
                                  {funeral.status.charAt(0).toUpperCase() +
                                    funeral.status.slice(1)}
                                </Badge>
                                <Badge
                                  className={`rounded-full ${
                                    funeral.is_visible !== false
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  }`}
                                >
                                  {funeral.is_visible !== false ? "Visible" : "Hidden"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                  <p className="text-sm text-slate-500">
                                    Organized by
                                  </p>
                                  <p className="text-slate-800">
                                    {funeral.organizer || "Not specified"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-500">
                                    Funeral Date
                                  </p>
                                  <p className="text-slate-800">
                                    {formatDate(funeral.funeral_date || "")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-500">
                                    Donations
                                  </p>
                                  <p className="text-slate-800">
                                    ₵
                                    {(
                                      funeral.donations_total || 0
                                    ).toLocaleString()}{" "}
                                    ({funeral.donations_count || 0} donations)
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-500">Created</p>
                                  <p className="text-slate-800">
                                    {formatDate(funeral.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {funeral.status === "pending" && (
                                <>
                                  <Button
                                    onClick={() => handleApproveFuneral(funeral.id)}
                                    variant="default"
                                    size="sm"
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectFuneral(funeral.id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                onClick={() => handleToggleVisibility(funeral.id, funeral.is_visible !== false)}
                                variant="outline"
                                size="sm"
                                className={`${
                                  funeral.is_visible !== false
                                    ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                                    : "border-green-200 text-green-600 hover:bg-green-50"
                                }`}
                              >
                                {funeral.is_visible !== false ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Show
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleBrochureUpload(funeral.id)}
                                variant="outline"
                                size="sm"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Brochure
                              </Button>
                              <Button
                                onClick={() =>
                                  router.push(`/funeral/${funeral.id}`)
                                }
                                variant="outline"
                                size="sm"
                                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="brochures" className="space-y-6">
                {selectedFuneralForBrochure ? (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                              Brochure Management
                            </CardTitle>
                            <p className="text-slate-600 mt-1">
                              Upload and manage brochures for{" "}
                              {pendingFunerals.find(f => f.id === selectedFuneralForBrochure)?.deceased_name}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedFuneralForBrochure(null)}
                          >
                            Back to Funerals
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <AdminBrochureUpload
                          funeralId={selectedFuneralForBrochure}
                          onUploadComplete={handleBrochureUploadComplete}
                          existingBrochures={funeralBrochures[selectedFuneralForBrochure] || []}
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">Brochure Management</CardTitle>
                      <p className="text-slate-600">
                        Select a funeral to manage its brochures
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-600">
                          Select a Funeral
                        </h3>
                        <p className="text-slate-500 mt-2">
                          Go to the Funeral Management tab and click the "Brochure" button next to any funeral to manage its brochures.
                        </p>
                        <Button
                          onClick={() => setActiveTab("overview")}
                          className="mt-4"
                          variant="outline"
                        >
                          Go to Funeral Management
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
