import { createServerClient } from "@/lib/supabase/server";
import { FuneralEventPage } from "@/components/funeral-event-page";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Simple base URL resolver safe for server and build-time.
function getSiteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://funeralsghana.com";
}

// Build a canonical slug path using id + normalized deceased name (if available)
function buildFuneralSlug(id: number | string, name?: string) {
  if (!name) return String(id);
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${id}-${slug}` : String(id);
}

// Dynamic metadata for SEO / social sharing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const raw = params.id;
  const numericPart = raw.split('-')[0];
  const funeralId = parseInt(numericPart, 10);
  if (isNaN(funeralId)) {
    return {
      title: "Memorial Not Found",
      description: "The requested memorial could not be located.",
      robots: { index: false },
    };
  }

  try {
    const supabase = createServerClient();
    const { data: funeral } = await supabase
      .from("funerals")
      .select("id, deceased_name, life_story, poster_url, image_url, funeral_date")
      .eq("id", funeralId.toString())
      .single();

    if (!funeral) {
      return {
        title: "Memorial Not Found",
        description: "The requested memorial could not be located.",
        robots: { index: false },
      };
    }

    const baseUrl = getSiteBaseUrl();
    const canonicalPath = `/funeral/${buildFuneralSlug(funeral.id, funeral.deceased_name)}`;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const title = `Memorial for ${funeral.deceased_name}`;
    const rawDesc = funeral.life_story || "Join us as we celebrate a cherished life.";
    const description = rawDesc.length > 180 ? rawDesc.slice(0, 177) + '…' : rawDesc;
    const imageCandidate = funeral.poster_url || funeral.image_url || "/funeral1.jpg";
    const imageUrl = imageCandidate.startsWith("http") ? imageCandidate : `${baseUrl}${imageCandidate}`;
    const eventDateIso = funeral.funeral_date ? new Date(funeral.funeral_date).toISOString() : undefined;

    // JSON-LD structured data (Person + Event)
    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: title,
      eventStatus: "https://schema.org/EventScheduled",
      description,
      url: canonicalUrl,
      image: [imageUrl],
      ...(eventDateIso ? { startDate: eventDateIso } : {}),
      // Person honored
      performer: {
        "@type": "Person",
        name: funeral.deceased_name,
        image: imageUrl,
      },
    };

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Funerals Ghana",
        type: "article",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      other: {
        // Provide JSON-LD inline (Next doesn't yet give first-class JSON-LD slot in Metadata API)
        "script:ld+json": JSON.stringify(jsonLd),
      },
    };
  } catch (e) {
    return {
      title: "Memorial",
      description: "View this memorial tribute.",
    };
  }
}

export default async function FuneralPage({
  params,
}: {
  params: { id: string };
}) {
  // Support hybrid slug form: `${id}-${slug}` while still accepting plain numeric id
  const raw = params.id;
  const numericPart = raw.split('-')[0];
  const funeralId = parseInt(numericPart, 10);
  if (isNaN(funeralId)) {
    console.error("Invalid funeral ID:", params.id);
    notFound();
  }

  console.log("Fetching funeral with ID:", funeralId);

  const supabase = createServerClient();
  const { data: funeral, error } = await supabase
    .from("funerals")
    .select("*")
    .eq("id", funeralId.toString())
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
        {/* Structured data injection fallback if Metadata.other not processed by some crawlers */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: `Memorial for ${funeral.deceased_name}`,
              description: funeral.life_story || "Memorial tribute",
              image: funeral.poster_url || funeral.image_url || "/funeral1.jpg",
              url: `${getSiteBaseUrl()}/funeral/${buildFuneralSlug(funeral.id, funeral.deceased_name)}`,
            }),
          }}
        />
        <FuneralEventPage funeral={funeralData} />
      </main>
      <Footer />
    </div>
  );
}
