import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, name, rating, category, message } = await request.json();

    if (!email || !rating || !message) {
      return NextResponse.json({ message: "Missing required fields (email, rating, message)" }, { status: 400 });
    }

    const newFeedback = new Feedback({
      email,
      name: name || "Anonymous",
      rating,
      category: category || "General",
      message,
    });

    await newFeedback.save();

    return NextResponse.json({ success: true, message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
    // Only for admin or developmental check if needed, but for now just a simple GET
    try {
        await dbConnect();
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(50);
        return NextResponse.json({ success: true, feedbacks });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
