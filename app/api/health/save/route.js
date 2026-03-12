import dbConnect from "@/lib/db";
import HealthRecord from "@/models/HealthRecord";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, record } = await request.json();

    if (!email || !record) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const newRecord = await HealthRecord.create({
      userId: user._id,
      diet: record.diet,
      symptoms: record.symptoms,
      severity: record.severity,
      diagnosis: record.diagnosis
    });

    return NextResponse.json(
      { success: true, record: newRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save health record error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
