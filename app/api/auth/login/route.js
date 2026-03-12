import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email }).lean();
    
    // Auto-create demo user if it doesn't exist
    if (!user && email === "demo@vitals.ai" && password === "password123") {
      user = await User.create({
        name: "Akshith",
        email: "demo@vitals.ai",
        password: "password123" // In production, this would be hashed
      });
    }

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Note: In a production app, password validation should use hashed comparisons.
    if (user.password !== password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const authenticatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      healthHistory: user.healthHistory,
      customReports: user.customReports,
      createdAt: user.createdAt
    };

    return NextResponse.json(
      { success: true, user: authenticatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
