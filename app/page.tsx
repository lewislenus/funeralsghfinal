import { HeroSection } from "@/components/hero-section";
import { FuneralDirectory } from "@/components/funeral-directory";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StatsSection } from "@/components/stats-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Metadata } from "next";

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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <FuneralDirectory />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
