import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuestionsManager } from "./questions-manager";
import { getAdminJob } from "@/lib/jobs";
import { getAdminSession } from "@/lib/session";
import { JobAdminNav } from "../../job-admin-nav";

export const dynamic = "force-dynamic";

export default async function JobQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session?.user?.id) redirect("/admin/login");
  const { id } = await params;
  const job = await getAdminJob(id);
  if (!job) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#5b675f]">
            <Link href={`/admin/jobs/${job.id}`} className="text-[#0f766e]">
              Back to posting
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Questions for {job.title}</h1>
          <p className="mt-2 max-w-2xl text-[#5b675f]">
            These appear on the public apply form after name, email, phone, and resume.
          </p>
        </div>
        <JobAdminNav jobId={job.id} />
      </div>
      <QuestionsManager jobId={job.id} questions={job.questions} />
    </div>
  );
}
