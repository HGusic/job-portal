import { JobStatus, Prisma, QuestionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteResumeObject } from "@/lib/s3";
import type { JobPayload } from "@/lib/job-payload";

export async function listPublishedJobs() {
  return prisma.job.findMany({
    where: { status: JobStatus.published },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      location: true,
      jobSummary: true,
      includeTitle: true,
      includeLocation: true,
      includeJobSummary: true,
      publishedAt: true,
    },
  });
}

export async function getPublishedJob(id: string) {
  return prisma.job.findFirst({
    where: { id, status: JobStatus.published },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function listAdminJobs() {
  return prisma.job.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { applications: true, questions: true } },
    },
  });
}

export async function getAdminJob(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      _count: { select: { applications: true } },
    },
  });
}

export async function createJob(input: JobPayload & { createdById: string }) {
  const { createdById, status, ...fields } = input;
  return prisma.job.create({
    data: {
      ...fields,
      status,
      createdById,
      publishedAt: status === JobStatus.published ? new Date() : null,
    },
  });
}

export async function updateJob(id: string, input: JobPayload) {
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) return null;

  const { status, ...fields } = input;
  const publishedAt =
    status === JobStatus.published ? existing.publishedAt ?? new Date() : existing.publishedAt;

  return prisma.job.update({
    where: { id },
    data: { ...fields, status, publishedAt },
  });
}

export async function deleteJob(id: string, options?: { confirm?: string }) {
  const applications = await prisma.application.findMany({
    where: { jobId: id },
    select: { id: true, resumeKey: true },
  });

  if (options?.confirm !== "DELETE") {
    const error = new Error('Type "DELETE" to permanently remove this posting.');
    error.name = "ConfirmationRequiredError";
    throw error;
  }

  for (const application of applications) {
    await deleteResumeObject(application.resumeKey).catch(() => undefined);
  }

  return prisma.$transaction(async (tx) => {
    if (applications.length > 0) {
      await tx.applicationAnswer.deleteMany({
        where: { applicationId: { in: applications.map((app) => app.id) } },
      });
      await tx.application.deleteMany({ where: { jobId: id } });
    }
    await tx.jobQuestion.deleteMany({ where: { jobId: id } });
    return tx.job.delete({ where: { id } });
  });
}

export async function createQuestion(input: {
  jobId: string;
  prompt: string;
  questionType: QuestionType;
  required: boolean;
  options?: string[] | null;
  sortOrder?: number;
}) {
  const max = await prisma.jobQuestion.aggregate({
    where: { jobId: input.jobId },
    _max: { sortOrder: true },
  });
  return prisma.jobQuestion.create({
    data: {
      jobId: input.jobId,
      prompt: input.prompt,
      questionType: input.questionType,
      required: input.required,
      options: input.questionType === QuestionType.dropdown ? (input.options ?? []) : Prisma.JsonNull,
      sortOrder: input.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
    },
  });
}

export async function updateQuestion(
  id: string,
  input: {
    prompt: string;
    questionType: QuestionType;
    required: boolean;
    sortOrder: number;
    options?: string[] | null;
  },
) {
  return prisma.jobQuestion.update({
    where: { id },
    data: {
      prompt: input.prompt,
      questionType: input.questionType,
      required: input.required,
      sortOrder: input.sortOrder,
      options:
        input.questionType === QuestionType.dropdown
          ? (input.options ?? [])
          : Prisma.JsonNull,
    },
  });
}

export async function deleteQuestion(id: string) {
  const answers = await prisma.applicationAnswer.count({
    where: { jobQuestionId: id },
  });
  if (answers > 0) {
    const error = new Error(
      "This question already has applicant answers and cannot be deleted.",
    );
    error.name = "ConflictError";
    throw error;
  }
  return prisma.jobQuestion.delete({ where: { id } });
}

export function isPrismaKnownError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}
