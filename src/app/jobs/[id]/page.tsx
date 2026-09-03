import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedJob } from "@/lib/jobs";
import { displayJobTitle, publicJobSections } from "@/lib/job-fields";

export const dynamic = "force-dynamic";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublishedJob(id);
  if (!job) notFound();
  const sections = publicJobSections(job);
  const heading = displayJobTitle(job);

  return (
    <article className="max-w-3xl">
      <p className="text-sm text-[#5b675f]">
        <Link href="/" className="text-[#0f766e] hover:underline">
          All open roles
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{heading}</h1>
      <div className="mt-8 space-y-8">
        {sections.length === 0 ? (
          <p className="text-[#5b675f]">Details for this role will be shared during the process.</p>
        ) : (
          sections.map((section) => (
            <section key={section.key}>
              <h2 className="text-lg font-semibold">{section.label}</h2>
              <p className="mt-2 whitespace-pre-wrap text-[#3f4a44]">{section.value}</p>
            </section>
          ))
        )}
      </div>
      <div className="mt-10">
        <Link
          href={`/jobs/${job.id}/apply`}
          className="inline-flex rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Apply
        </Link>
      </div>
    </article>
  );
}
