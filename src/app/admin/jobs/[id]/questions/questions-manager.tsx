"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { optionsFromLines, parseQuestionOptions } from "@/lib/question-options";

type Question = {
  id: string;
  prompt: string;
  questionType: "short_text" | "long_text" | "yes_no" | "dropdown";
  required: boolean;
  sortOrder: number;
  options?: unknown;
};

function formatQuestionType(questionType: Question["questionType"]) {
  return questionType.replace("_", " ");
}

export function QuestionsManager({ jobId, questions }: { jobId: string; questions: Question[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [questionType, setQuestionType] = useState<Question["questionType"]>("short_text");

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const type = String(data.get("questionType") ?? "short_text") as Question["questionType"];
    const options =
      type === "dropdown" ? optionsFromLines(String(data.get("options") ?? "")) : undefined;

    if (type === "dropdown" && (options?.length ?? 0) < 2) {
      setPending(false);
      setError("Add at least two dropdown options (one per line).");
      return;
    }

    const response = await fetch(`/api/admin/jobs/${jobId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: String(data.get("prompt") ?? ""),
        questionType: type,
        required: String(data.get("required") ?? "yes") === "yes",
        options,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Unable to add question.");
      return;
    }
    form.reset();
    setQuestionType("short_text");
    router.refresh();
  }

  async function onDelete(questionId: string) {
    setError(null);
    const response = await fetch(`/api/admin/jobs/${jobId}/questions/${questionId}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Unable to delete question.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {questions.length === 0 ? (
          <li className="rounded-xl border border-dashed border-[#e4ddd3] p-4 text-[#5b675f]">
            No custom questions yet. Applicants will still provide contact details and a resume.
          </li>
        ) : (
          questions.map((question) => {
            const options = parseQuestionOptions(question.options);
            return (
              <li
                key={question.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-4"
              >
                <div>
                  <p className="font-medium">{question.prompt}</p>
                  <p className="mt-1 text-sm text-[#5b675f]">
                    {formatQuestionType(question.questionType)} ·{" "}
                    {question.required ? "required" : "optional"}
                  </p>
                  {question.questionType === "dropdown" && options.length > 0 ? (
                    <p className="mt-2 text-sm text-[#5b675f]">Options: {options.join(" · ")}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(question.id)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Delete
                </button>
              </li>
            );
          })
        )}
      </ul>

      <form
        onSubmit={onCreate}
        className="flex flex-col rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6"
      >
        <div className="space-y-4">
          <h2 className="font-semibold">Add a question</h2>
          <label className="block">
            <span className="text-sm font-medium">Prompt</span>
            <input
              name="prompt"
              required
              placeholder="Why do you want to work here?"
              className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Type</span>
            <select
              name="questionType"
              value={questionType}
              onChange={(event) =>
                setQuestionType(event.target.value as Question["questionType"])
              }
              className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
            >
              <option value="short_text">Short text</option>
              <option value="long_text">Long text</option>
              <option value="yes_no">Yes / no</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </label>
          {questionType === "dropdown" ? (
            <label className="block">
              <span className="text-sm font-medium">Options (one per line)</span>
              <textarea
                name="options"
                required
                rows={4}
                placeholder={"Full-time\nPart-time\nPRN"}
                className="mt-1 w-full rounded-lg border border-[#e4ddd3] bg-white px-3 py-2"
              />
            </label>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <span>Required</span>
            <select
              name="required"
              defaultValue="yes"
              className="rounded-lg border border-[#e4ddd3] bg-white px-2 py-1"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#115e59] disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add question"}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#e4ddd3] pt-4">
          <button
            type="button"
            onClick={() => {
              router.push("/admin/jobs");
              router.refresh();
            }}
            className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#115e59]"
          >
            Save posting
          </button>
        </div>
      </form>
    </div>
  );
}
