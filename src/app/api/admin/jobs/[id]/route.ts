import { NextResponse } from "next/server";
import { deleteJob, getAdminJob, updateJob } from "@/lib/jobs";
import { jobPayloadSchema } from "@/lib/job-payload";
import { getAdminSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const job = await getAdminJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ job });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = jobPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job fields." }, { status: 400 });
  }
  const job = await updateJob(id, parsed.data);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ job });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let confirm: string | undefined;
  try {
    const body = (await request.json()) as { confirm?: string };
    confirm = body.confirm;
  } catch {
    confirm = undefined;
  }
  try {
    await deleteJob(id, { confirm });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ConfirmationRequiredError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to delete job." }, { status: 500 });
  }
}
