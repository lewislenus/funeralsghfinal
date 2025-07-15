import { type NextRequest, NextResponse } from "next/server"
import { donationsAPI } from "@/lib/api/donations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { funeral_id, donor_name, donor_email, amount, currency, message, payment_method } = body

    if (!funeral_id || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await donationsAPI.createDonation({
      funeral_id,
      donor_name,
      donor_email,
      amount: Number.parseFloat(amount),
      currency: currency || "GHS",
      message,
      payment_method,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      data: result.data,
      success: true,
      message: "Donation initiated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
