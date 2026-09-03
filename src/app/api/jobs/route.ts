import { NextResponse } from "next/server";
import { listPublishedJobs } from "@/lib/jobs";

export async function GET() {
  const jobs = await listPublishedJobs();
  return NextResponse.json({ jobs });
}
