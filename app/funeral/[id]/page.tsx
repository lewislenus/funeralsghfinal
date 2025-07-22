import { createServerClient } from "@/lib/supabase/server";
import { FuneralEventPage } from "@/components/funeral-event-page";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";

export default async function FuneralPage({ params }: { params: { id: string } }) {
  console.log("Fetching funeral with ID:", params.id);
  
  const supabase = createServerClient();
  const { data: funeral, error } = await supabase
    .from("funerals")
    .select("*")
    .eq("id", params.id)
    .eq("status", "approved")
    .single();

  console.log("Supabase response:", { data: funeral, error });

  if (error) {
    console.error("Error fetching funeral:", error);
    notFound();
  }

  if (!funeral) {
    console.log("No funeral found with ID:", params.id);
    notFound();
  }

  // Transform the flat data structure from Supabase to the nested structure expected by the component
  const funeralData = {
    id: funeral.id,
    deceased: {
      name: funeral.deceased_name,
      photo: funeral.image_url || "/funeral1.jpg",
      dob: funeral.date_of_birth,
      dod: funeral.date_of_death,
      life_story: funeral.life_story || "",
    },
    funeral: {
      date: funeral.funeral_date,
      time: funeral.funeral_time, // Assuming you have a funeral_time column
      venue: funeral.venue, // Assuming you have a venue column
      region: funeral.region, // Assuming you have a region column
      location: funeral.funeral_location,
      coordinates: funeral.coordinates as { lat: number; lng: number } || { lat: 0, lng: 0 },
    },
    organized_by: funeral.organized_by || "Family",
    poster: funeral.poster_url || "",
    brochure_url: funeral.brochure_url || "",
    livestream_url: funeral.livestream_url || null,
    isUpcoming: new Date(funeral.funeral_date) > new Date(),
    // These are not in the single funeral fetch, so we provide default/empty values.
    // You would need to fetch these separately if needed.
    condolences: [], 
    donations: { total: 0, currency: 'USD', supporters: 0, recent: [] },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <main className="pt-20">
        <FuneralEventPage funeral={funeralData} />
      </main>
      <Footer />
    </div>
  );
}
