import { QuestionType } from "@prisma/client";

export function parseQuestionOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const options: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const value = item.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    options.push(value);
  }
  return options;
}

export function optionsFromLines(text: string): string[] {
  return parseQuestionOptions(text.split(/\r?\n/));
}

export function questionNeedsOptions(questionType: QuestionType | string) {
  return questionType === QuestionType.dropdown || questionType === "dropdown";
}
