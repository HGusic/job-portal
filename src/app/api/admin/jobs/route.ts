import { NextResponse } from "next/server";
import { createJob, listAdminJobs } from "@/lib/jobs";
import { jobPayloadSchema } from "@/lib/job-payload";
import { getAdminSession } from "@/lib/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const jobs = await listAdminJobs();
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = jobPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job fields." }, { status: 400 });
  }
  const job = await createJob({
    createdById: session.user.id,
    ...parsed.data,
  });
  return NextResponse.json({ job }, { status: 201 });
}
