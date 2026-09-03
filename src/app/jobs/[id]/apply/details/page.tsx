import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedJob } from "@/lib/jobs";
import { displayJobTitle } from "@/lib/job-fields";
import { parseQuestionOptions } from "@/lib/question-options";
import { DetailsForm } from "../details-form";

export const dynamic = "force-dynamic";

export default async function JobApplyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getPublishedJob(id);
  if (!job) notFound();
  const heading = displayJobTitle(job);

  return (
    <div className="w-full">
      <p className="text-sm text-[#5b675f]">
        <Link href={`/jobs/${job.id}/apply`} className="text-[#0f766e] hover:underline">
          Back to contact information
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Apply · {heading}</h1>
      <p className="mt-2 text-[#5b675f]">Step 2 of 2 · Resume and questions</p>
      <div className="mt-6">
        <DetailsForm
          jobId={job.id}
          questions={job.questions.map((question) => ({
            id: question.id,
            prompt: question.prompt,
            questionType: question.questionType,
            required: question.required,
            options: parseQuestionOptions(question.options),
          }))}
        />
      </div>
    </div>
  );
}
