import { HeroSection } from "@/components/hero-section";
import { FuneralDirectory } from "@/components/funeral-directory";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StatsSection } from "@/components/stats-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { UpcomingFuneralsTicker, type UpcomingFuneralLite } from "@/components/upcoming-funerals-ticker";
import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: 'damerifa Dua - Premier Funeral Services Platform',
  description: 'Welcome to damerifa Dua, where we honor the lives and memories of our loved ones. Find funeral announcements, share condolences, make donations, and celebrate the legacy of those who have passed. Serving communities worldwide with compassion and dignity.',
  keywords: 'funeral services, funeral announcements, obituary, condolences, memorial services, funeral donations, tribute, remembrance, damerifa Dua',
  
  openGraph: {
    title: 'damerifa Dua - Premier Funeral Services Platform',
    description: 'Honor the lives and memories of loved ones. Find funeral announcements, share condolences, and celebrate their legacy with dignity and compassion.',
    url: 'https://damerifadua.netlify.app',
    images: [
      {
        url: '/funeral1.jpg',
        width: 1200,
        height: 630,
        alt: 'damerifa Dua - Honoring Lives and Memories',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'damerifa Dua - Funeral Services Platform',
    description: 'Honor lives, share condolences, and celebrate memories with compassion.',
    images: ['/funeral1.jpg'],
  },
};

export default async function HomePage() {
  // Server-side fetch upcoming funerals (approved + visible + not in past)
  const supabase = createServerClient();
  const todayStr = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('funerals')
    .select('id, deceased_name, funeral_date, funeral_time, venue, poster_url, image_url, location, is_visible, status')
    .eq('status', 'approved')
    .eq('is_visible', true)
    .gte('funeral_date', todayStr)
    .order('funeral_date', { ascending: true })
    .limit(30);

  const upcoming: UpcomingFuneralLite[] = (data || []).map(f => ({
    id: f.id.toString(),
    deceased_name: f.deceased_name,
    funeral_date: f.funeral_date,
    funeral_time: f.funeral_time,
    venue: f.venue,
    poster_url: f.poster_url,
    image_url: f.image_url,
    location: f.location,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main>
        <HeroSection />
        <UpcomingFuneralsTicker funerals={upcoming} />
        <StatsSection />
        <FeaturesSection />
        <FuneralDirectory />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
