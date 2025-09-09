import { type NextRequest, NextResponse } from "next/server"
import { funeralsAPI, type FuneralFilters } from "@/lib/api/funerals"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: FuneralFilters = {
      search: searchParams.get("search") || undefined,
      region: searchParams.get("region") || undefined,
      status: (searchParams.get("status") as "upcoming" | "past" | "all") || "all",
      dateRange: (searchParams.get("dateRange") as "week" | "month" | "all") || "all",
      // Sanitize values like "date:1" that sometimes appear from dev tooling by taking the part before ':'
      sortBy: ((searchParams.get("sortBy")?.split(":")[0] as "date" | "name" | "recent" | "popular") || "date"),
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined,
    }

    const result = await funeralsAPI.getFunerals(filters)

    if (result.error) {
      console.error("/api/funerals error:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      data: result.data,
      count: result.count,
      success: true,
    })
  } catch (error) {
    console.error("/api/funerals unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
