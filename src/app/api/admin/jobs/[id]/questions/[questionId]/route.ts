import { QuestionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteQuestion, updateQuestion } from "@/lib/jobs";
import { parseQuestionOptions, questionNeedsOptions } from "@/lib/question-options";
import { getAdminSession } from "@/lib/session";

const questionSchema = z
  .object({
    prompt: z.string().trim().min(1).max(500),
    questionType: z.nativeEnum(QuestionType),
    required: z.boolean(),
    sortOrder: z.number().int(),
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { questionId } = await params;
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
  const question = await updateQuestion(questionId, {
    prompt: parsed.data.prompt,
    questionType: parsed.data.questionType,
    required: parsed.data.required,
    sortOrder: parsed.data.sortOrder,
    options,
  });
  return NextResponse.json({ question });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { questionId } = await params;
    await deleteQuestion(questionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ConflictError") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to delete question." }, { status: 500 });
  }
}
