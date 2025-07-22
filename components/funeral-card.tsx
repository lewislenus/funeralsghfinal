"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Share2,
  Heart,
  Eye,
  MessageCircle,
  DollarSign,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface FuneralCardProps {
  funeral: {
    id: string;
    deceased: {
      name: string;
      photo: string;
      dob: string;
      dod: string;
      biography: string;
    };
    funeral: {
      date: string;
      time: string;
      venue: string;
      region: string;
      location: string;
    };
    family: string;
    poster: string;
    livestream: string | null;
    isUpcoming: boolean;
    condolences: number;
    donations: number;
    views: number;
  };
}

export function FuneralCard({ funeral }: FuneralCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (dob: string, dod: string) => {
    const birth = new Date(dob);
    const death = new Date(dod);
    return death.getFullYear() - birth.getFullYear();
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/funeral/${funeral.id}`;
    const shareText = `Join us in honoring the memory of ${funeral.deceased.name}`;

    if (navigator.share) {
      navigator.share({
        title: `Memorial for ${funeral.deceased.name}`,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // You could show a toast notification here
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm">
        {/* Header Image */}
        <div className="relative overflow-hidden">
          <Image
            src={funeral.poster || "/funeral2.jpg"}
            alt={`${funeral.deceased.name} funeral poster`}
            width={400}
            height={240}
            className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Overlay Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex flex-col space-y-2">
              {funeral.isUpcoming ? (
                <Badge className="bg-green-500/90 hover:bg-green-600 text-white backdrop-blur-sm shadow-lg">
                  <Calendar className="w-3 h-3 mr-1" />
                  Upcoming
                </Badge>
              ) : (
                <Badge className="bg-slate-500/90 hover:bg-slate-600 text-white backdrop-blur-sm shadow-lg">
                  <Clock className="w-3 h-3 mr-1" />
                  Past Service
                </Badge>
              )}
              {funeral.livestream && (
                <Badge className="bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-sm shadow-lg">
                  <Play className="w-3 h-3 mr-1" />
                  Live Stream
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full w-10 h-10 p-0 shadow-lg"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        <CardContent className="p-6">
          {/* Profile Section */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="relative flex-shrink-0">
              <Image
                src={funeral.deceased.photo || "/funeral1.jpg"}
                alt={funeral.deceased.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full border-2 border-white flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                {funeral.deceased.name}
              </h3>
              <p className="text-slate-600 text-sm mb-1">
                {new Date(funeral.deceased.dob).getFullYear()} -{" "}
                {new Date(funeral.deceased.dod).getFullYear()}
                <span className="ml-2 text-amber-600 font-medium">
                  ({calculateAge(funeral.deceased.dob, funeral.deceased.dod)}{" "}
                  years)
                </span>
              </p>
              <p className="text-slate-500 text-sm font-medium">
                {funeral.family}
              </p>
            </div>
          </div>

          {/* Biography */}
          <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">
            {funeral.deceased.biography}
          </p>

          {/* Event Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-slate-600">
              <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg mr-3 flex-shrink-0">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="font-medium">
                  {formatDate(funeral.funeral.date)}
                </span>
                <span className="text-slate-500 ml-2">
                  at {funeral.funeral.time}
                </span>
              </div>
            </div>

            <div className="flex items-center text-sm text-slate-600">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{funeral.funeral.venue}</p>
                <p className="text-slate-500 truncate">
                  {funeral.funeral.location}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Eye className="w-4 h-4 text-slate-500 mr-1" />
                <span className="text-sm font-bold text-slate-800">
                  {funeral.views}
                </span>
              </div>
              <p className="text-xs text-slate-500">Views</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <MessageCircle className="w-4 h-4 text-slate-500 mr-1" />
                <span className="text-sm font-bold text-slate-800">
                  {funeral.condolences}
                </span>
              </div>
              <p className="text-xs text-slate-500">Messages</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="w-4 h-4 text-slate-500 mr-1" />
                <span className="text-sm font-bold text-green-600">
                  ₵{funeral.donations.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500">Raised</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/funeral/${funeral.id}`}>View Memorial</Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="px-4 border-slate-300 hover:bg-slate-50 rounded-xl bg-white/80 backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
