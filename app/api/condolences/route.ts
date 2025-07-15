import { type NextRequest, NextResponse } from "next/server"
import { condolencesAPI } from "@/lib/api/condolences"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { funeral_id, author_name, author_email, author_location, message } = body

    if (!funeral_id || !author_name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await condolencesAPI.createCondolence({
      funeral_id,
      author_name,
      author_email,
      author_location,
      message,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      data: result.data,
      success: true,
      message: "Condolence submitted successfully. It will be reviewed before being published.",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
