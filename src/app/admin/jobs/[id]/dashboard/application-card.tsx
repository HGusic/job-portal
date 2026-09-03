"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Answer = {
  id: string;
  answerText: string;
  jobQuestion: { prompt: string };
};

type ApplicationCardProps = {
  jobId: string;
  application: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    cityLine: string;
    submittedAtLabel: string;
    answers: Answer[];
  };
  expanded: boolean;
  onToggle: () => void;
  onDeleted: (applicationId: string) => void;
};

export function ApplicationCard({
  jobId,
  application,
  expanded,
  onToggle,
  onDeleted,
}: ApplicationCardProps) {
  const router = useRouter();
  const hasAnswers = application.answers.length > 0;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setPending(true);
    setError(null);
    const response = await fetch(
      `/api/admin/jobs/${jobId}/applications/${application.id}`,
      { method: "DELETE" },
    );
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Unable to delete application.");
      return;
    }
    setConfirmOpen(false);
    onDeleted(application.id);
    router.refresh();
  }

  return (
    <li className="rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{application.fullName}</p>
          <p className="mt-1 text-sm text-[#5b675f]">
            <a className="text-[#0f766e]" href={`mailto:${application.email}`}>
              {application.email}
            </a>
            {` · ${application.phone}`}
          </p>
          <p className="mt-1 text-sm text-[#5b675f]">
            {application.address}
            {application.cityLine ? ` · ${application.cityLine}` : ""}
          </p>
          <p className="mt-1 text-sm text-[#5b675f]">Submitted {application.submittedAtLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/admin/jobs/${jobId}/applications/${application.id}/resume`}
            className="rounded-lg bg-[#0f766e] px-3 py-2 text-sm font-medium text-white hover:bg-[#115e59]"
          >
            Download resume
          </a>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setConfirmOpen(true);
            }}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete application
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-[#e4ddd3] pt-4">
        {hasAnswers ? (
          <>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              className="text-sm font-medium text-[#0f766e] hover:underline"
            >
              {expanded ? "Hide information" : "Expand for information"}
            </button>
            {expanded ? (
              <dl className="mt-4 space-y-3">
                {application.answers.map((answer) => (
                  <div key={answer.id}>
                    <dt className="text-sm font-medium">{answer.jobQuestion.prompt}</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-[#3f4a44]">{answer.answerText}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-[#5b675f]">No custom answers for this application.</p>
        )}
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-app-title-${application.id}`}
            className="w-full max-w-md rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6 shadow-lg"
          >
            <h2
              id={`delete-app-title-${application.id}`}
              className="text-lg font-semibold"
            >
              Are you sure?
            </h2>
            <p className="mt-3 text-sm text-[#5b675f]">
              Delete the application from{" "}
              <span className="font-medium text-[#2f3b34]">{application.fullName}</span>? This
              cannot be undone.
            </p>
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-[#e4ddd3] px-4 py-2 text-sm font-medium text-[#5b675f] hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}
