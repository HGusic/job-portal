export function getPracticeName() {
  return process.env.PRACTICE_NAME ?? "Practice Careers";
}

export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || current.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }
  current.count += 1;
  if (current.count > limit) {
    return { ok: false as const };
  }
  return { ok: true as const };
}

export function resumeExtension(filename: string, contentType: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf") || contentType === "application/pdf") return "pdf";
  if (lower.endsWith(".doc") || contentType === "application/msword") return "doc";
  if (
    lower.endsWith(".docx") ||
    contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  return null;
}
