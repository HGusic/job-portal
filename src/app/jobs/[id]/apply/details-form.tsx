"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  contactStorageKey,
  type ContactInfo,
  validateContactInfo,
} from "@/lib/apply-contact";

type Question = {
  id: string;
  prompt: string;
  questionType: "short_text" | "long_text" | "yes_no" | "dropdown";
  required: boolean;
  options?: string[];
};

function isYesNoQuestion(questionType: string) {
  return questionType === "yes_no" || questionType === "yes-no" || questionType === "YES_NO";
}

function isDropdownQuestion(questionType: string) {
  return questionType === "dropdown";
}

export function DetailsForm({ jobId, questions }: { jobId: string; questions: Question[] }) {
  const router = useRouter();
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(contactStorageKey(jobId));
    if (!raw) {
      router.replace(`/jobs/${jobId}/apply`);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ContactInfo;
      if (validateContactInfo(parsed)) {
        sessionStorage.removeItem(contactStorageKey(jobId));
        router.replace(`/jobs/${jobId}/apply`);
        return;
      }
      setContact(parsed);
    } catch {
      sessionStorage.removeItem(contactStorageKey(jobId));
      router.replace(`/jobs/${jobId}/apply`);
    }
  }, [jobId, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contact) return;
    setError(null);
    setPending(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const answers: Record<string, string> = {};
    for (const question of questions) {
      answers[question.id] = String(data.get(`q-${question.id}`) ?? "");
      data.delete(`q-${question.id}`);
    }
    data.set("answers", JSON.stringify(answers));
    data.set("firstName", contact.firstName);
    data.set("middleName", contact.middleName);
    data.set("lastName", contact.lastName);
    data.set("email", contact.email);
    data.set("phone", contact.phone);
    data.set("address", contact.address);
    data.set("zipCode", contact.zipCode);
    data.set("state", contact.state);

    const response = await fetch(`/api/jobs/${jobId}/applications`, {
      method: "POST",
      body: data,
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Unable to submit application.");
      return;
    }

    sessionStorage.removeItem(contactStorageKey(jobId));
    router.push(`/jobs/${jobId}/apply/thanks`);
  }

  if (!contact) {
    return <p className="text-sm text-[#5b675f]">Loading…</p>;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6"
    >
      <h2 className="text-lg font-semibold">Resume and questions</h2>
      <label className="block">
        <span className="text-sm font-medium">Resume (PDF or Word, max 10 MB)</span>
        <input
          name="resume"
          type="file"
          required
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-1 w-full text-sm"
        />
      </label>
      {questions.map((question) => (
        <div key={question.id} className="block">
          <label htmlFor={`q-${question.id}`} className="text-sm font-medium">
            {question.prompt}
            {question.required ? "" : " (optional)"}
          </label>
          {isYesNoQuestion(question.questionType) ? (
            <div className="relative mt-1">
              <select
                id={`q-${question.id}`}
                name={`q-${question.id}`}
                required={question.required}
                defaultValue=""
                className="w-full appearance-none rounded-lg border border-[#e4ddd3] bg-white px-3 py-2 pr-10"
              >
                <option value="" disabled>
                  Select yes or no
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#5b675f]"
              >
                ▾
              </span>
            </div>
          ) : isDropdownQuestion(question.questionType) ? (
            <div className="relative mt-1">
              <select
                id={`q-${question.id}`}
                name={`q-${question.id}`}
                required={question.required}
                defaultValue=""
                className="w-full appearance-none rounded-lg border border-[#e4ddd3] bg-white px-3 py-2 pr-10"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {(question.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#5b675f]"
              >
                ▾
              </span>
            </div>
          ) : (
            <textarea
              id={`q-${question.id}`}
              name={`q-${question.id}`}
              required={question.required}
              rows={question.questionType === "long_text" ? 5 : 2}
              className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
            />
          )}
        </div>
      ))}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => router.push(`/jobs/${jobId}/apply`)}
          className="rounded-lg border border-[#cfc6ba] bg-white px-4 py-2 font-medium text-[#2f3b34] hover:bg-[#f7f2eb] disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
