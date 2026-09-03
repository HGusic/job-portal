import { redirect } from "next/navigation";
import { JobForm } from "../job-form";
import { getAdminSession } from "@/lib/session";

export default async function NewJobPage() {
  const session = await getAdminSession();
  if (!session?.user?.id) redirect("/admin/login");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New job posting</h1>
      <JobForm />
    </div>
  );
}
