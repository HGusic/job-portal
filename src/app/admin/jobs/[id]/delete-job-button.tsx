"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

type Step = "confirm" | "type-delete";

export function DeleteJobButton({
  jobId,
  applicationCount,
}: {
  jobId: string;
  applicationCount: number;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("confirm");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canTypeDelete = confirmText === "DELETE";

  useEffect(() => {
    setMounted(true);
  }, []);

  async function deleteJob() {
    if (!canTypeDelete || pending) return;
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/jobs/${jobId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Unable to delete.");
      return;
    }
    router.push("/admin/jobs");
    router.refresh();
  }

  function close() {
    setOpen(false);
    setStep("confirm");
    setConfirmText("");
    setError(null);
  }

  function openDialog() {
    setStep("confirm");
    setConfirmText("");
    setError(null);
    setOpen(true);
  }

  const dialog =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-job-title"
              className="w-full max-w-md rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6 shadow-lg"
            >
              {step === "confirm" ? (
                <>
                  <h2 id="delete-job-title" className="text-lg font-semibold">
                    Delete this posting?
                  </h2>
                  <div className="mt-3 space-y-4">
                    <p className="text-sm text-[#5b675f]">
                      {applicationCount > 0 ? (
                        <>
                          This posting has{" "}
                          <span className="font-medium text-foreground">
                            {applicationCount} application
                            {applicationCount === 1 ? "" : "s"}
                          </span>
                          . Continuing will permanently delete those applications, answers, and
                          resumes.
                        </>
                      ) : (
                        <>This cannot be undone. There are no applications on this posting.</>
                      )}
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={close}
                        className="rounded-lg border border-[#e4ddd3] px-4 py-2 text-sm font-medium text-[#5b675f] hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setConfirmText("");
                          setStep("type-delete");
                        }}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="delete-job-title" className="text-lg font-semibold">
                    Final confirmation
                  </h2>
                  <div className="mt-3 space-y-4 text-sm text-[#5b675f]">
                    <p>
                      Type <span className="font-semibold text-foreground">DELETE</span> to
                      permanently remove this posting
                      {applicationCount > 0
                        ? ` and all ${applicationCount} application${applicationCount === 1 ? "" : "s"}`
                        : ""}
                      .
                    </p>
                    <label className="block">
                      <span className="sr-only">Type DELETE to confirm</span>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(event) => setConfirmText(event.target.value)}
                        autoFocus
                        placeholder="DELETE"
                        autoComplete="off"
                        className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2 text-foreground"
                      />
                    </label>
                    {error ? <p className="text-sm text-red-700">{error}</p> : null}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={close}
                        className="rounded-lg border border-[#e4ddd3] px-4 py-2 text-sm font-medium text-[#5b675f] hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!canTypeDelete || pending}
                        onClick={() => void deleteJob()}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {pending ? "Deleting…" : "Delete posting"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div>
      <button
        type="button"
        onClick={openDialog}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Delete posting
      </button>
      {dialog}
    </div>
  );
}
