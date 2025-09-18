"use client";

import { useEffect, useState } from "react";
import { FuneralCard } from "./funeral-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function FuneralDirectory() {
  const [funerals, setFunerals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform API data to format expected by FuneralCard
  const transformFuneralData = (apiData: any) => {
    return {
      id: apiData.id,
      deceased: {
        name: apiData.deceased_name || "Unknown",
        photo: apiData.deceased_photo_url || apiData.image_url || apiData.poster_url || "/funeral1.jpg",
        dob: apiData.date_of_birth || "",
        dod: apiData.date_of_death || "",
        biography: apiData.biography || apiData.life_story || "",
      },
      funeral: {
        date: apiData.funeral_date || "",
        time: apiData.funeral_time || "",
        venue: apiData.venue || apiData.funeral_location || "",
        region: apiData.region || "",
        location: apiData.location || "",
      },
      family: apiData.family_name || apiData.organized_by || "Family",
      poster: apiData.poster_url || apiData.image_url || "/funeral2.jpg",
      livestream: apiData.livestream_url,
      isUpcoming: apiData.funeral_date ? new Date(apiData.funeral_date) > new Date() : false,
      condolences: apiData.condolences_count || 0,
      donations: apiData.donations_total || 0,
      views: apiData.views_count || apiData.view_count || 0,
    };
  };

  useEffect(() => {
    async function fetchFunerals() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/funerals/featured");
        const result = await res.json();
        
        if (!res.ok)
          throw new Error(result.error || "Failed to fetch funerals");
        
        // Transform the data to match FuneralCard expectations
        const transformedFunerals = (result.data || []).map(transformFuneralData);
        
        // Filter to only show upcoming funerals (exclude past events)
        const upcomingFunerals = transformedFunerals.filter((funeral: any) => {
          if (!funeral.funeral.date) return false; // Skip funerals without a date
          const funeralDate = new Date(funeral.funeral.date);
          const today = new Date();
          // Set today to start of day to include events happening today
          today.setHours(0, 0, 0, 0);
          return funeralDate >= today;
        });
        
        setFunerals(upcomingFunerals);
      } catch (err) {
        console.error("Error fetching featured funerals:", err);
        setError((err as Error).message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchFunerals();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Upcoming Funeral Services
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Upcoming memorial services worldwide. Browse, leave
            condolences, share memories, and show support to grieving families.
          </p>

          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Link href="/funerals">
              View All Funerals
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </motion.div>

        {/* Funeral Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            Loading funerals...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Error: {error}</div>
        ) : funerals.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No upcoming funerals found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {funerals.map((funeral, index) => (
              <motion.div
                key={funeral.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FuneralCard funeral={funeral} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Need to Create a Memorial?
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Honor your loved one with a beautiful, dignified memorial page
              that brings family and friends together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl px-8 py-4 font-semibold"
              >
                <Link href="/signup">Create Memorial</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 rounded-xl px-8 py-4 font-semibold bg-transparent"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
