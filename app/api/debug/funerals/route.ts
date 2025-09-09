import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: funerals, error } = await supabase
      .from("funerals")
      .select("id, deceased_name, status, featured")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: funerals?.length || 0,
      funerals: funerals?.map(f => ({
        id: f.id,
        id_type: typeof f.id,
        id_length: f.id?.length,
        deceased_name: f.deceased_name,
        status: f.status,
        featured: f.featured
      })) || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
