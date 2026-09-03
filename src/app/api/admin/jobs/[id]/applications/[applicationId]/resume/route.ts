import { NextResponse } from "next/server";
import { getApplicationForJob } from "@/lib/applications";
import { getResumeObject } from "@/lib/s3";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; applicationId: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, applicationId } = await params;
  const application = await getApplicationForJob(id, applicationId);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  try {
    const object = await getResumeObject(application.resumeKey);
    const bytes = await object.Body?.transformToByteArray();
    if (!bytes) {
      return NextResponse.json({ error: "Resume file is empty." }, { status: 404 });
    }
    const filename = application.resumeKey.split("/").pop() ?? "resume.pdf";
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Resume could not be downloaded." }, { status: 404 });
  }
}
