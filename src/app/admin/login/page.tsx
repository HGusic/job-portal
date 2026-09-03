import { Suspense } from "react";
import AdminLoginPage from "./page-client";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <AdminLoginPage />
    </Suspense>
  );
}
