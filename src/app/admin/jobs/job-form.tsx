"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteJobButton } from "./[id]/delete-job-button";
import { JOB_SECTIONS, type JobContentFields } from "@/lib/job-fields";

type JobStatus = "draft" | "published" | "closed";

type JobFields = JobContentFields & { status: JobStatus };

const defaultFields: JobFields = {
  title: "",
  location: "",
  jobSummary: "",
  responsibilities: "",
  requiredQualifications: "",
  preferredQualifications: "",
  includeTitle: true,
  includeLocation: true,
  includeJobSummary: true,
  includeResponsibilities: true,
  includeRequiredQualifications: true,
  includePreferredQualifications: true,
  status: "draft",
};

export function JobForm({
  initial,
  jobId,
  applicationCount = 0,
}: {
  initial?: Partial<JobFields>;
  jobId?: string;
  applicationCount?: number;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "next" | null>(null);
  const [included, setIncluded] = useState(() => ({
    includeTitle: initial?.includeTitle ?? true,
    includeLocation: initial?.includeLocation ?? true,
    includeJobSummary: initial?.includeJobSummary ?? true,
    includeResponsibilities: initial?.includeResponsibilities ?? true,
    includeRequiredQualifications: initial?.includeRequiredQualifications ?? true,
    includePreferredQualifications: initial?.includePreferredQualifications ?? true,
  }));
  const values = { ...defaultFields, ...initial };

  async function saveJob(intent: "save" | "next") {
    const form = formRef.current;
    if (!form) return;
    if (!form.reportValidity()) return;

    setPending(intent);
    setError(null);
    const data = new FormData(form);
    const payload = {
      title: String(data.get("title") ?? ""),
      location: String(data.get("location") ?? ""),
      jobSummary: String(data.get("jobSummary") ?? ""),
      responsibilities: String(data.get("responsibilities") ?? ""),
      requiredQualifications: String(data.get("requiredQualifications") ?? ""),
      preferredQualifications: String(data.get("preferredQualifications") ?? ""),
      includeTitle: included.includeTitle,
      includeLocation: included.includeLocation,
      includeJobSummary: included.includeJobSummary,
      includeResponsibilities: included.includeResponsibilities,
      includeRequiredQualifications: included.includeRequiredQualifications,
      includePreferredQualifications: included.includePreferredQualifications,
      status: String(data.get("status") ?? "draft"),
    };
    const response = await fetch(jobId ? `/api/admin/jobs/${jobId}` : "/api/admin/jobs", {
      method: jobId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string; job?: { id: string } };
    setPending(null);
    if (!response.ok) {
      setError(result.error ?? "Unable to save job.");
      return;
    }

    const savedId = result.job?.id ?? jobId;
    if (intent === "next" && savedId) {
      router.push(`/admin/jobs/${savedId}/questions`);
      router.refresh();
      return;
    }
    if (!jobId && savedId) {
      router.replace(`/admin/jobs/${savedId}`);
    }
    router.refresh();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveJob("next");
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex flex-col rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6"
    >
      <div className="space-y-4">
        {JOB_SECTIONS.map((section) => {
          const includeKey = section.includeKey;
          const isIncluded = included[includeKey];
          return (
            <div key={section.key} className="rounded-lg border border-[#e4ddd3] bg-white/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{section.label}</span>
                <label className="flex items-center gap-2 text-sm text-[#5b675f]">
                  <span>Include</span>
                  <select
                    value={isIncluded ? "yes" : "no"}
                    onChange={(event) =>
                      setIncluded((current) => ({
                        ...current,
                        [includeKey]: event.target.value === "yes",
                      }))
                    }
                    className="rounded-lg border border-[#e4ddd3] bg-white px-2 py-1 text-sm text-foreground"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              </div>
              {section.kind === "input" ? (
                <input
                  name={section.key}
                  defaultValue={values[section.key]}
                  readOnly={!isIncluded}
                  className="mt-3 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2 read-only:bg-[#f3f1ec] read-only:text-[#8a918b]"
                />
              ) : (
                <textarea
                  name={section.key}
                  rows={5}
                  defaultValue={values[section.key]}
                  readOnly={!isIncluded}
                  className="mt-3 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2 read-only:bg-[#f3f1ec] read-only:text-[#8a918b]"
                />
              )}
            </div>
          );
        })}

        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            defaultValue={values.status}
            className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending !== null}
          className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#115e59] disabled:opacity-60"
        >
          {pending === "next" ? "Saving…" : "Next"}
        </button>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#e4ddd3] pt-4">
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => void saveJob("save")}
          className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#115e59] disabled:opacity-60"
        >
          {pending === "save" ? "Saving…" : "Save posting"}
        </button>
        <div>
          {jobId ? (
            <DeleteJobButton jobId={jobId} applicationCount={applicationCount} />
          ) : null}
        </div>
      </div>
    </form>
  );
}
