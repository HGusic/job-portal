"use client";

import { useState } from "react";
import { ApplicationCard } from "./application-card";

type Answer = {
  id: string;
  answerText: string;
  jobQuestion: { prompt: string };
};

type Application = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  cityLine: string;
  submittedAtLabel: string;
  answers: Answer[];
};

export function ApplicationsList({
  jobId,
  applications,
}: {
  jobId: string;
  applications: Application[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [removedIds, setRemovedIds] = useState<Record<string, true>>({});
  const visible = applications.filter((app) => !removedIds[app.id]);
  const expandableIds = visible
    .filter((app) => app.answers.length > 0)
    .map((app) => app.id);
  const allExpanded =
    expandableIds.length > 0 && expandableIds.every((id) => expanded[id] === true);

  function toggleOne(id: string) {
    setExpanded((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function toggleAll() {
    if (allExpanded) {
      setExpanded({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const id of expandableIds) {
      next[id] = true;
    }
    setExpanded(next);
  }

  if (visible.length === 0) {
    return (
      <p className="rounded-xl border border-[#e4ddd3] bg-[#fffcf8] p-6 text-[#5b675f]">
        No applications yet for this posting.
      </p>
    );
  }

  return (
    <div>
      {expandableIds.length > 0 ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-lg border border-[#0f766e] px-3 py-1.5 text-sm font-medium text-[#0f766e] hover:bg-[#f3faf8]"
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </div>
      ) : null}
      <ul className="space-y-4">
        {visible.map((application) => (
          <ApplicationCard
            key={application.id}
            jobId={jobId}
            application={application}
            expanded={expanded[application.id] === true}
            onToggle={() => toggleOne(application.id)}
            onDeleted={(applicationId) =>
              setRemovedIds((current) => ({ ...current, [applicationId]: true }))
            }
          />
        ))}
      </ul>
    </div>
  );
}
