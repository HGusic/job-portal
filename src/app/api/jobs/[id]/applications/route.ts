import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { submitApplication } from "@/lib/applications";
import { rateLimit } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`apply:${ip}:${id}`).ok) {
    return NextResponse.json(
      { error: "Too many applications from this network. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();
    const result = await submitApplication(id, formData);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Please check name, email, and answers." }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid answers payload." }, { status: 400 });
    }
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message : "Unable to submit application.";
    if (name === "NotFoundError") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (name === "ValidationError") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to submit application." }, { status: 500 });
  }
}
