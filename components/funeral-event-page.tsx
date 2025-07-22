"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Share2,
  Play,
  FileText,
  DollarSign,
  MessageCircle,
  Heart,
  Users,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { GuestbookForm } from "./guestbook-form";
import { DonationWidget } from "./donation-widget";
import { FlipbookViewer } from "./flipbook-viewer";
import { motion } from "framer-motion";

interface FuneralEventPageProps {
  funeral: {
    id: string;
    deceased: {
      name: string;
      photo: string;
      dob: string;
      dod: string;
      life_story: string;
    };
    funeral: {
      date: string;
      time: string;
      venue: string;
      region: string;
      location: string;
      coordinates: { lat: number; lng: number };
    };
    organized_by: string;
    poster: string;
    brochure_url: string;
    livestream_url: string | null;
    isUpcoming: boolean;
    condolences: Array<{
      id: string;
      name: string;
      message: string;
      location: string;
      timestamp: string;
      avatar?: string;
    }>;
    donations: {
      total: number;
      currency: string;
      supporters: number;
      recent: Array<{
        name: string;
        amount: number;
        message: string;
      }>;
    };
  };
}

export function FuneralEventPage({ funeral }: FuneralEventPageProps) {
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dob: string, dod: string) => {
    const birth = new Date(dob);
    const death = new Date(dod);
    return death.getFullYear() - birth.getFullYear();
  };

  const shareUrl = `https://funeralsghana.com/funeral/${funeral.id}`;

  const handleShare = (platform: string) => {
    const text = `Join us in honoring the memory of ${funeral.deceased.name}`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        text + " " + shareUrl
      )}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      copy: shareUrl,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } else {
      window.open(urls[platform as keyof typeof urls], "_blank");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-8 md:p-12 mb-12 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-orange-500/20 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Profile Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Image
                  src={funeral.deceased?.photo || "/funeral1.jpg"}
                  alt={funeral.deceased?.name || "Funeral Photo"}
                  width={200}
                  height={200}
                  className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover border-4 border-amber-500 shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-lg">
                  <Heart className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 text-white">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
  {funeral.deceased?.name || "Unnamed"}
</h1>
                {funeral.isUpcoming && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm">
                    Upcoming Service
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xl text-slate-300 mb-2">
                    {funeral.deceased?.dob ? new Date(funeral.deceased.dob).toLocaleDateString() : "N/A"} -{" "}
                    {funeral.deceased?.dod ? new Date(funeral.deceased.dod).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="text-amber-300 font-semibold text-lg">
                    {funeral.deceased?.dob && funeral.deceased?.dod ? calculateAge(funeral.deceased.dob, funeral.deceased.dod) : "N/A"}{" "}
                    years of life
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-slate-300">
                    <Calendar className="w-5 h-5 mr-3 text-amber-400" />
                    <span>
                      {formatDate(funeral.funeral.date)} at{" "}
                      {funeral.funeral.time}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <MapPin className="w-5 h-5 mr-3 text-amber-400" />
                    <span>
                      {funeral.funeral.venue}, {funeral.funeral.location}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Users className="w-5 h-5 mr-3 text-amber-400" />
                    <span>Organized by {funeral.organized_by}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => handleShare("whatsapp")}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => handleShare("facebook")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleShare("copy")}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 rounded-xl px-6"
                >
                  Copy Link
                </Button>
                {funeral.livestream_url && (
                  <a href={funeral.livestream_url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Livestream
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl p-1">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="condolences"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="overview" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-800">
                      Life Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-slate-700 leading-relaxed text-lg">
                      {funeral.deceased.life_story}
                    </p>

                    <Separator />

                    <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">
                          Funeral Brochure
                        </h3>
                        {funeral.brochure_url ? (
                          <div className="mt-4">
                            <FlipbookViewer pdfUrl={funeral.brochure_url} onClose={() => {}} />
                          </div>
                        ) : (
                          <p className="text-slate-500">The funeral brochure is not available yet.</p>
                        )}
                      </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4">
                        Service Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-amber-600 mr-3" />
                            <div>
                              <p className="font-medium text-slate-800">
                                Date & Time
                              </p>
                              <p className="text-slate-600">
                                {formatDate(funeral.funeral.date)} at{" "}
                                {funeral.funeral.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-amber-600 mr-3" />
                            <div>
                              <p className="font-medium text-slate-800">
                                Venue
                              </p>
                              <p className="text-slate-600">
                                {funeral.funeral.venue}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-amber-600 mr-3" />
                            <div>
                              <p className="font-medium text-slate-800">
                                Location
                              </p>
                              <p className="text-slate-600">
                                {funeral.funeral.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                            <Users className="w-5 h-5 text-amber-600 mr-3" />
                            <div>
                              <p className="font-medium text-slate-800">
                                Region
                              </p>
                              <p className="text-slate-600">
                                {funeral.funeral.region}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="condolences" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <GuestbookForm funeralId={funeral.id} />

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-slate-800">
                      <MessageCircle className="w-5 h-5 mr-2 text-amber-600" />
                      Condolence Messages ({funeral.condolences.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {funeral.condolences.map((condolence) => (
                        <div
                          key={condolence.id}
                          className="flex space-x-4 p-4 bg-slate-50 rounded-xl"
                        >
                          <Image
                            src={condolence.avatar || "/funeral3.jpg"}
                            alt={condolence.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {condolence.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {condolence.location}
                                </p>
                              </div>
                              <p className="text-xs text-slate-400">
                                {new Date(
                                  condolence.timestamp
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {condolence.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="support" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <DonationWidget
                  funeralId={funeral.id}
                  deceasedName={funeral.deceased.name}
                  totalDonations={funeral.donations.total}
                  currency={funeral.donations.currency}
                  supporters={funeral.donations.supporters}
                  recentDonations={funeral.donations.recent as any}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800">
                      Photo Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square bg-slate-200 rounded-xl flex items-center justify-center"
                        >
                          <span className="text-slate-500">Photo {i}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  Community Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {funeral.donations.currency}{" "}
                      {funeral.donations.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">Total Raised</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">
                      {funeral.donations.supporters}
                    </div>
                    <div className="text-sm text-blue-700">Supporters</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">
                      {funeral.condolences.length}
                    </div>
                    <div className="text-sm text-purple-700">Messages</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <div className="text-2xl font-bold text-amber-600">
                      500+
                    </div>
                    <div className="text-sm text-amber-700">Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Funeral Poster */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  Funeral Poster
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Image
                  src={funeral.poster || "/funeral2.jpg"}
                  alt="Funeral poster"
                  width={400}
                  height={600}
                  className="w-full rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Brochure */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  Funeral Brochure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => funeral.brochure_url && setShowFlipbook(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl py-3"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Interactive Brochure
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-48 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium">
                      Interactive Map
                    </p>
                    <p className="text-sm text-slate-500">
                      Google Maps integration
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-slate-800">
                    {funeral.funeral.venue}
                  </p>
                  <p className="text-slate-600">{funeral.funeral.location}</p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl bg-transparent"
                  >
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Flipbook Modal */}
      {showFlipbook && (
        <FlipbookViewer
          pdfUrl={funeral.brochure_url}
          onClose={() => setShowFlipbook(false)}
        />
      )}
    </div>
  );
}
