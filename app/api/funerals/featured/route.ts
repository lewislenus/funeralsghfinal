import { funeralsAPI } from "@/lib/api/funerals";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await funeralsAPI.getFeaturedFunerals();

    if (error) {
      console.error("API Error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      console.error("No data returned from getFeaturedFunerals");
      return NextResponse.json({ error: "No data returned" }, { status: 400 });
    }

    // Return in the format expected by the frontend
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error fetching featured funerals:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
