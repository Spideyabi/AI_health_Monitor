import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import HealthRecord from "@/models/HealthRecord";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).select("-password").lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch AI Generated Reports
    const aiReports = await HealthRecord.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ user, aiReports });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { email, profileData } = await req.json();

    if (!email || !profileData) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: profileData },
      { new: true, runValidators: true }
    ).select("-password").lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated", user });
  } catch (error) {
    return NextResponse.json({ message: "Update failed", error: error.message }, { status: 500 });
  }
}
