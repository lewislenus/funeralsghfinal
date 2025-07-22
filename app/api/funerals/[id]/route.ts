import { type NextRequest, NextResponse } from "next/server";
import { funeralsAPI } from "@/lib/api/funerals";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await funeralsAPI.getFuneral(params.id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Funeral not found" ? 404 : 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate status is one of the allowed values
    const validStatuses = [
      "draft",
      "pending",
      "approved",
      "rejected",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const result = await funeralsAPI.updateFuneral(params.id, { status });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
