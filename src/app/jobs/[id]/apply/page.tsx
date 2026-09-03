import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedJob } from "@/lib/jobs";
import { displayJobTitle } from "@/lib/job-fields";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export default async function JobApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublishedJob(id);
  if (!job) notFound();
  const heading = displayJobTitle(job);

  return (
    <div className="w-full">
      <p className="text-sm text-[#5b675f]">
        <Link href={`/jobs/${job.id}`} className="text-[#0f766e] hover:underline">
          Back to job details
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Apply · {heading}</h1>
      <p className="mt-2 text-[#5b675f]">Step 1 of 2 · Contact information</p>
      <div className="mt-6">
        <ContactForm jobId={job.id} />
      </div>
    </div>
  );
}
