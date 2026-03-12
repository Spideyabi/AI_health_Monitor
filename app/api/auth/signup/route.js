import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Note: In a production app, password hashing (e.g. bcrypt) should be used.
    // Simplifying here for the demo requirement.
    const user = await User.create({
      name,
      email,
      password, // Should be hashed!
    });

    const createdUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age || null,
      gender: user.gender || null,
      weight: user.weight || null,
      height: user.height || null,
      healthHistory: user.healthHistory || "",
      customReports: user.customReports || [],
      createdAt: user.createdAt
    };

    return NextResponse.json(
      { success: true, user: createdUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return NextResponse.json(
      { message: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
