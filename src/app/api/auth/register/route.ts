import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/database/client";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // For development, use real database now that it's set up
    if (process.env.NODE_ENV === "development" && process.env.USE_MOCK_AUTH === "true") {
      console.log("Using development mock registration");
      
      // Simulate user creation without database
      const mockUser = {
        id: "mock-user-" + Date.now(),
        name: validatedData.name,
        email: validatedData.email,
        role: "ADMIN",
        tenantId: "mock-tenant-" + Date.now(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json(
        {
          message: "User created successfully (development mode)",
          user: mockUser,
        },
        { status: 201 }
      );
    }

    // Check if user already exists globally (across all tenants)
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create tenant (distributor) first
    const tenant = await prisma.tenant.create({
      data: {
        name: validatedData.company,
        subdomain: validatedData.company.toLowerCase().replace(/\s+/g, "-"),
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: "FREEMIUM",
        isActive: true,
      },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "ADMIN", // First user is admin of their tenant
        tenantId: tenant.id,
        isActive: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    // More detailed error for development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { 
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}