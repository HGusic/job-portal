import Link from "next/link";
import { redirect } from "next/navigation";
import { listAdminJobs } from "@/lib/jobs";
import { displayJobTitle } from "@/lib/job-fields";
import { getAdminSession } from "@/lib/session";
import { JobAdminNav } from "./job-admin-nav";

export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = {
  published: "text-green-700",
  draft: "text-yellow-600",
  closed: "text-red-700",
};

export default async function AdminJobsPage() {
  const session = await getAdminSession();
  if (!session?.user?.id) redirect("/admin/login");
  const jobs = await listAdminJobs();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Job postings</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/jobs/new"
            className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#115e59]"
          >
            New posting
          </Link>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {jobs.length === 0 ? (
          <li className="rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6 text-[#5b675f]">
            No postings yet. Create one to collect applications.
          </li>
        ) : (
          jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-5"
            >
              <div>
                <p className="font-semibold">{displayJobTitle(job)}</p>
                <p className="text-sm text-[#5b675f]">
                  <span className={`font-semibold uppercase ${statusClass[job.status] ?? ""}`}>
                    {job.status}
                  </span>
                  {" · "}
                  {job._count.questions} questions · {job._count.applications} applications
                </p>
              </div>
              <JobAdminNav jobId={job.id} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
