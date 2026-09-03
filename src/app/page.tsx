import Link from "next/link";
import { listPublishedJobs } from "@/lib/jobs";
import { displayJobTitle } from "@/lib/job-fields";
import { getPracticeName } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jobs = await listPublishedJobs();
  const practice = getPracticeName();

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#0f766e]">Careers</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Join {practice}</h1>
      <p className="mt-3 max-w-2xl text-[#5b675f]">
        Browse open positions. You can apply without creating an account.
      </p>

      {jobs.length === 0 ? (
        <p className="mt-10 rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-8 text-[#5b675f]">
          There are no open positions right now. Please check back soon.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {jobs.map((job) => {
            const title = displayJobTitle(job);
            const location =
              job.includeLocation && job.location.trim() ? job.location.trim() : "";
            const summary =
              job.includeJobSummary && job.jobSummary.trim() ? job.jobSummary.trim() : "";

            return (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6 transition hover:border-[#0f766e]"
                >
                  <h2 className="text-xl font-semibold">{title}</h2>
                  {location ? (
                    <p className="mt-2 text-sm font-medium text-[#5b675f]">{location}</p>
                  ) : null}
                  {summary ? (
                    <p className="mt-2 line-clamp-3 text-[#5b675f]">{summary}</p>
                  ) : null}
                  <span className="mt-4 inline-block text-sm font-medium text-[#0f766e]">
                    View role
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
