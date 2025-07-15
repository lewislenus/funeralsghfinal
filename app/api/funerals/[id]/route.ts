import { type NextRequest, NextResponse } from "next/server"
import { funeralsAPI } from "@/lib/api/funerals"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await funeralsAPI.getFuneral(params.id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.error === "Funeral not found" ? 404 : 500 })
    }

    return NextResponse.json({
      data: result.data,
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
