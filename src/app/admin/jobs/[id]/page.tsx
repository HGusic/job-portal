import { notFound, redirect } from "next/navigation";
import { JobForm } from "../job-form";
import { JobAdminNav } from "../job-admin-nav";
import { getAdminJob } from "@/lib/jobs";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session?.user?.id) redirect("/admin/login");
  const { id } = await params;
  const job = await getAdminJob(id);
  if (!job) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit posting</h1>
        <JobAdminNav jobId={job.id} />
      </div>
      <JobForm
        jobId={job.id}
        applicationCount={job._count.applications}
        initial={{
          title: job.title,
          location: job.location,
          jobSummary: job.jobSummary,
          responsibilities: job.responsibilities,
          requiredQualifications: job.requiredQualifications,
          preferredQualifications: job.preferredQualifications,
          includeTitle: job.includeTitle,
          includeLocation: job.includeLocation,
          includeJobSummary: job.includeJobSummary,
          includeResponsibilities: job.includeResponsibilities,
          includeRequiredQualifications: job.includeRequiredQualifications,
          includePreferredQualifications: job.includePreferredQualifications,
          status: job.status,
        }}
      />
    </div>
  );
}
