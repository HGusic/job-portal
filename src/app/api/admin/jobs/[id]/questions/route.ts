import { QuestionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createQuestion, getAdminJob } from "@/lib/jobs";
import { parseQuestionOptions, questionNeedsOptions } from "@/lib/question-options";
import { getAdminSession } from "@/lib/session";

const questionSchema = z
  .object({
    prompt: z.string().trim().min(1).max(500),
    questionType: z.nativeEnum(QuestionType),
    required: z.boolean().default(true),
    options: z.array(z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    if (!questionNeedsOptions(value.questionType)) return;
    const options = parseQuestionOptions(value.options ?? []);
    if (options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dropdown questions need at least two options.",
        path: ["options"],
      });
    }
  });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const job = await getAdminJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ questions: job.questions });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const job = await getAdminJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  const parsed = questionSchema.safeParse(await request.json());
  if (!parsed.success) {
    const message =
      parsed.error.issues.find((issue) => issue.path[0] === "options")?.message ??
      "Invalid question fields.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const options = questionNeedsOptions(parsed.data.questionType)
    ? parseQuestionOptions(parsed.data.options ?? [])
    : null;
  const question = await createQuestion({
    jobId: id,
    prompt: parsed.data.prompt,
    questionType: parsed.data.questionType,
    required: parsed.data.required,
    options,
  });
  return NextResponse.json({ question }, { status: 201 });
}
