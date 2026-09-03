import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listApplicationsForJob } from "@/lib/applications";
import { formatApplicantName } from "@/lib/apply-contact";
import { getAdminJob } from "@/lib/jobs";
import { getAdminSession } from "@/lib/session";
import { JobAdminNav } from "../../job-admin-nav";
import { ApplicationsList } from "./applications-list";

export const dynamic = "force-dynamic";

function formatSubmittedAt(value: Date) {
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export default async function JobDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session?.user?.id) redirect("/admin/login");
  const { id } = await params;
  const job = await getAdminJob(id);
  if (!job) notFound();
  const applications = await listApplicationsForJob(id);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#5b675f]">
            <Link href="/admin/jobs" className="text-[#0f766e]">
              All postings
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Dashboard · {job.title}</h1>
          <p className="mt-2 text-[#5b675f]">
            {applications.length} {applications.length === 1 ? "application" : "applications"}
          </p>
        </div>
        <JobAdminNav jobId={job.id} />
      </div>

      {applications.length === 0 ? (
        <p className="rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6 text-[#5b675f]">
          No applications yet for this posting.
        </p>
      ) : (
        <ApplicationsList
          jobId={job.id}
          applications={applications.map((application) => ({
            id: application.id,
            fullName: formatApplicantName(application),
            email: application.email,
            phone: application.phone,
            address: application.address,
            cityLine: [application.state, application.zipCode].filter(Boolean).join(" "),
            submittedAtLabel: formatSubmittedAt(application.submittedAt),
            answers: application.answers.map((answer) => ({
              id: answer.id,
              answerText: answer.answerText,
              jobQuestion: { prompt: answer.jobQuestion.prompt },
            })),
          }))}
        />
      )}
    </div>
  );
}
