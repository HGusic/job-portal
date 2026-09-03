export const JOB_SECTIONS = [
  { key: "title", label: "Title", includeKey: "includeTitle", kind: "input" as const },
  { key: "location", label: "Location", includeKey: "includeLocation", kind: "input" as const },
  {
    key: "jobSummary",
    label: "Job Summary",
    includeKey: "includeJobSummary",
    kind: "textarea" as const,
  },
  {
    key: "responsibilities",
    label: "Responsibilities",
    includeKey: "includeResponsibilities",
    kind: "textarea" as const,
  },
  {
    key: "requiredQualifications",
    label: "Required Qualifications",
    includeKey: "includeRequiredQualifications",
    kind: "textarea" as const,
  },
  {
    key: "preferredQualifications",
    label: "Preferred Qualifications",
    includeKey: "includePreferredQualifications",
    kind: "textarea" as const,
  },
] as const;

export type JobSectionKey = (typeof JOB_SECTIONS)[number]["key"];
export type JobIncludeKey = (typeof JOB_SECTIONS)[number]["includeKey"];

export type JobContentFields = Record<JobSectionKey, string> & Record<JobIncludeKey, boolean>;

export function displayJobTitle(job: {
  title: string;
  includeTitle: boolean;
  location?: string;
  includeLocation?: boolean;
}) {
  if (job.includeTitle && job.title.trim()) return job.title.trim();
  if (job.includeLocation && job.location?.trim()) return job.location.trim();
  if (job.title.trim()) return job.title.trim();
  return "Untitled posting";
}

export function publicJobSections(job: {
  title: string;
  location: string;
  jobSummary: string;
  responsibilities: string;
  requiredQualifications: string;
  preferredQualifications: string;
  includeTitle: boolean;
  includeLocation: boolean;
  includeJobSummary: boolean;
  includeResponsibilities: boolean;
  includeRequiredQualifications: boolean;
  includePreferredQualifications: boolean;
}) {
  return JOB_SECTIONS.flatMap((section) => {
    const included = job[section.includeKey];
    const value = job[section.key].trim();
    if (!included || !value) return [];
    return [{ label: section.label, value, key: section.key }];
  });
}
