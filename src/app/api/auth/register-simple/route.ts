import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock successful registration
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: "test-user-" + Date.now(),
          name: body.name,
          email: body.email,
          company: body.company || "Default Company"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}