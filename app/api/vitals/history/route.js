import dbConnect from "@/lib/db";
import DailyVitals from "@/models/DailyVitals";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get last 7 days of records, sorted by date ASC
    const history = await DailyVitals.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(7);

    // Return in ascending order for the graph
    return NextResponse.json({ success: true, history: history.reverse() });
  } catch (error) {
    console.error("Fetch vitals history error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { email, vitals } = await request.json();

    if (!email || !vitals) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

    // Upsert today's record
    const record = await DailyVitals.findOneAndUpdate(
      { userId: user._id, date: today },
      { 
        day: dayName,
        sleep: vitals.sleep,
        distance: vitals.distance,
        screenTime: vitals.screenTime
      },
      { upsert: true, new: true }
    );

    // Roll over: Delete anything older than 7 days
    const allRecords = await DailyVitals.find({ userId: user._id }).sort({ date: -1 });
    if (allRecords.length > 7) {
      const idsToDelete = allRecords.slice(7).map(r => r._id);
      await DailyVitals.deleteMany({ _id: { $in: idsToDelete } });
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Save vitals history error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
