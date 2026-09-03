import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";

export default async function AdminHome() {
  const session = await getAdminSession();
  if (!session?.user?.id) redirect("/admin/login");
  redirect("/admin/jobs");
}
