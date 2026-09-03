import Link from "next/link";

const linkClass =
  "rounded-lg border border-[#cfc8be] bg-[#e8e4dc] px-3 py-1.5 text-sm font-medium text-[#3f4a44] hover:bg-[#ddd7cd]";

export function JobAdminNav({ jobId }: { jobId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/jobs/${jobId}`} className={linkClass}>
        Edit Job Post
      </Link>
      <Link href={`/admin/jobs/${jobId}/questions`} className={linkClass}>
        Edit Job Questions
      </Link>
      <Link href={`/admin/jobs/${jobId}/dashboard`} className={linkClass}>
        View Applicants
      </Link>
      <a href={`/api/admin/jobs/${jobId}/applications/export`} className={linkClass}>
        Export to Excel
      </a>
    </div>
  );
}
