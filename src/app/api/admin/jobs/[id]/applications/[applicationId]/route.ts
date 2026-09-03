import { NextResponse } from "next/server";
import { deleteApplication } from "@/lib/applications";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; applicationId: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, applicationId } = await params;
  try {
    await deleteApplication(id, applicationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to delete application." }, { status: 500 });
  }
}
