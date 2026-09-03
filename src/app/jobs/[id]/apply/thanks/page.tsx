import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedJob } from "@/lib/jobs";
import { displayJobTitle } from "@/lib/job-fields";

export const dynamic = "force-dynamic";

export default async function JobApplyThanksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getPublishedJob(id);
  if (!job) notFound();
  const heading = displayJobTitle(job);

  return (
    <div className="w-full rounded-xl border border-[#cde7e3] bg-[#f3faf8] p-8 text-center">
      <h1 className="text-2xl font-semibold text-[#115e59]">Thank you</h1>
      <p className="mt-3 text-[#3f4a44]">
        Your application for <span className="font-medium">{heading}</span> has been successfully
        submitted.
      </p>
      <p className="mt-2 text-sm text-[#5b675f]">The practice will review your materials.</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        Back to open roles
      </Link>
    </div>
  );
}
