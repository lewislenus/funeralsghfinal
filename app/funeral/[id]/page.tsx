import { createServerClient } from "@/lib/supabase/server";
import { FuneralEventPage } from "@/components/funeral-event-page";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";

export default async function FuneralPage({
  params,
}: {
  params: { id: string };
}) {
  const funeralId = parseInt(params.id, 10);
  if (isNaN(funeralId)) {
    console.error("Invalid funeral ID:", params.id);
    notFound();
  }

  console.log("Fetching funeral with ID:", funeralId);

  const supabase = createServerClient();
  const { data: funeral, error } = await supabase
    .from("funerals")
    .select("*")
    .eq("id", funeralId)
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
    id: funeral.id.toString(), // Convert ID to string for the component
    deceased: {
      name: funeral.deceased_name,
      photo: funeral.image_url || "/funeral1.jpg",
      dob: funeral.date_of_birth || "Not specified",
      dod: funeral.date_of_death || "Not specified",
      life_story: funeral.life_story || "",
    },
    funeral: {
      date: funeral.funeral_date || "Not specified",
      time: funeral.funeral_time || "Not specified",
      venue: funeral.venue || "Not specified",
      region: funeral.region || "Not specified",
      location: funeral.funeral_location || "Not specified",
    },
    organized_by: funeral.organized_by || "Family",
    poster: funeral.poster_url || "",
    brochure_url: funeral.brochure_url || "",
    livestream_url: funeral.livestream_url || null,
    isUpcoming: funeral.funeral_date ? new Date(funeral.funeral_date) > new Date() : false,
    condolences: [],
    donations: { total: 0, currency: "USD", supporters: 0, recent: [] },
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
