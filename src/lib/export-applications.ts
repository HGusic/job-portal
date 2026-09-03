import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

function sanitizeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "job";
}

export async function buildApplicationsWorkbook(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      applications: {
        orderBy: { submittedAt: "desc" },
        include: {
          answers: true,
        },
      },
    },
  });
  if (!job) return null;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Job Portal";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Applicants");
  const questionHeaders = job.questions.map((question, index) => {
    const label = question.prompt.trim() || `Question ${index + 1}`;
    return label.length > 80 ? `${label.slice(0, 77)}...` : label;
  });

  sheet.columns = [
    { header: "First name", key: "firstName", width: 16 },
    { header: "Middle name", key: "middleName", width: 14 },
    { header: "Last name", key: "lastName", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Address", key: "address", width: 32 },
    { header: "Zip code", key: "zipCode", width: 12 },
    { header: "State", key: "state", width: 10 },
    { header: "Submitted at (UTC)", key: "submittedAt", width: 22 },
    ...questionHeaders.map((header, index) => ({
      header,
      key: `q${index}`,
      width: 28,
    })),
  ];

  sheet.getRow(1).font = { bold: true };

  for (const application of job.applications) {
    const answersByQuestion = new Map(
      application.answers.map((answer) => [answer.jobQuestionId, answer.answerText]),
    );
    const row: Record<string, string> = {
      firstName: application.firstName,
      middleName: application.middleName ?? "",
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      address: application.address,
      zipCode: application.zipCode,
      state: application.state,
      submittedAt: application.submittedAt.toISOString(),
    };
    job.questions.forEach((question, index) => {
      row[`q${index}`] = answersByQuestion.get(question.id) ?? "";
    });
    sheet.addRow(row);
  }

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const filename = `${sanitizeFilename(job.title || "job")}-applicants.xlsx`;
  return { buffer, filename, jobTitle: job.title };
}
