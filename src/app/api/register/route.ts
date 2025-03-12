import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email, password, firstName, lastName, role } = await request.json();

  if (!email || !password || !firstName || !lastName || !role) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    // Используем переменную `error` для получения дополнительной информации
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "User already exists or an error occurred" },
      { status: 400 }
    );
  }
}