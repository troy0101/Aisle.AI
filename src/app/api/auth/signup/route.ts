import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
  partnerNames: z.string().min(1, "Tell us both your names"),
  weddingDate: z.string().optional()
});

// Signup also creates the couple's first Wedding record so they land
// straight in the dashboard instead of an empty account with no context.
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password, name, partnerNames, weddingDate } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      weddings: {
        create: {
          partnerNames,
          weddingDate: weddingDate ? new Date(weddingDate) : undefined
        }
      }
    }
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
