import { randomUUID } from "crypto";
import { QuestionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ALLOWED_RESUME_TYPES, MAX_RESUME_BYTES, resumeExtension } from "@/lib/config";
import { deleteResumeObject, putResumeObject, resumeObjectKey } from "@/lib/s3";
import { US_STATES } from "@/lib/apply-contact";
import { parseQuestionOptions } from "@/lib/question-options";

const applySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(1).max(40),
  address: z.string().trim().min(1).max(300),
  zipCode: z.string().trim().min(3).max(20),
  state: z.enum(US_STATES),
  answers: z.record(z.string(), z.string()),
});

export async function submitApplication(jobId: string, formData: FormData) {
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "published" },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (!job) {
    const error = new Error("Job not found or is not open for applications.");
    error.name = "NotFoundError";
    throw error;
  }

  const rawAnswers = formData.get("answers");
  let parsedAnswers: Record<string, string> = {};
  if (typeof rawAnswers === "string" && rawAnswers.length > 0) {
    parsedAnswers = JSON.parse(rawAnswers) as Record<string, string>;
  }

  const middleRaw = String(formData.get("middleName") ?? "").trim();
  const fields = applySchema.parse({
    firstName: formData.get("firstName"),
    middleName: middleRaw || undefined,
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    zipCode: formData.get("zipCode"),
    state: formData.get("state"),
    answers: parsedAnswers,
  });

  for (const question of job.questions) {
    const value = (fields.answers[question.id] ?? "").trim();
    if (question.required && !value) {
      const error = new Error(`Please answer: ${question.prompt}`);
      error.name = "ValidationError";
      throw error;
    }
    if (question.questionType === QuestionType.yes_no && value) {
      if (value !== "yes" && value !== "no") {
        const error = new Error(`Please answer yes or no: ${question.prompt}`);
        error.name = "ValidationError";
        throw error;
      }
    }
    if (question.questionType === QuestionType.dropdown && value) {
      const options = parseQuestionOptions(question.options);
      if (!options.includes(value)) {
        const error = new Error(`Please select a valid option: ${question.prompt}`);
        error.name = "ValidationError";
        throw error;
      }
    }
  }

  const resume = formData.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    const error = new Error("A resume file is required.");
    error.name = "ValidationError";
    throw error;
  }
  if (resume.size > MAX_RESUME_BYTES) {
    const error = new Error("Resume must be 10 MB or smaller.");
    error.name = "ValidationError";
    throw error;
  }
  const ext = resumeExtension(resume.name, resume.type);
  if (!ext || !ALLOWED_RESUME_TYPES.includes(resume.type as (typeof ALLOWED_RESUME_TYPES)[number])) {
    if (!ext) {
      const error = new Error("Resume must be a PDF or Word document.");
      error.name = "ValidationError";
      throw error;
    }
  }

  const applicationId = randomUUID();
  const key = resumeObjectKey(jobId, applicationId, `resume.${ext}`);
  const buffer = Buffer.from(await resume.arrayBuffer());

  await putResumeObject(key, buffer, resume.type || "application/octet-stream");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.application.create({
        data: {
          id: applicationId,
          jobId,
          firstName: fields.firstName,
          middleName: fields.middleName || null,
          lastName: fields.lastName,
          email: fields.email.toLowerCase(),
          phone: fields.phone,
          address: fields.address,
          zipCode: fields.zipCode,
          state: fields.state,
          resumeKey: key,
        },
      });
      const rows = job.questions
        .map((question) => ({
          applicationId,
          jobQuestionId: question.id,
          answerText: (fields.answers[question.id] ?? "").trim(),
        }))
        .filter((row) => row.answerText.length > 0);
      if (rows.length > 0) {
        await tx.applicationAnswer.createMany({ data: rows });
      }
    });
  } catch (error) {
    await deleteResumeObject(key).catch(() => undefined);
    throw error;
  }

  return { applicationId };
}

export async function listApplicationsForJob(jobId: string) {
  return prisma.application.findMany({
    where: { jobId },
    orderBy: { submittedAt: "desc" },
    include: {
      answers: {
        include: { jobQuestion: true },
        orderBy: { jobQuestion: { sortOrder: "asc" } },
      },
    },
  });
}

export async function getApplicationForJob(jobId: string, applicationId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, jobId },
  });
}

export async function deleteApplication(jobId: string, applicationId: string) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, jobId },
  });
  if (!application) {
    const error = new Error("Application not found.");
    error.name = "NotFoundError";
    throw error;
  }

  await prisma.application.delete({ where: { id: application.id } });
  await deleteResumeObject(application.resumeKey).catch(() => undefined);
  return { ok: true as const };
}
