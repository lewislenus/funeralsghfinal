import { HeroSection } from "@/components/hero-section";
import { FuneralDirectory } from "@/components/funeral-directory";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StatsSection } from "@/components/stats-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";

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
