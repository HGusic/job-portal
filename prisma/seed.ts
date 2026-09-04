import { PrismaClient, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

function s3() {
  const endpoint = process.env.S3_ENDPOINT;
  return new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true" || Boolean(endpoint),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "kidzandteendental@orthodontics").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "kidzandteendental";
  const passwordHash = await bcrypt.hash(password, 12);

  const legacyEmails = ["admin@brightsmile.local", "1@1"];
  for (const legacy of legacyEmails) {
    if (legacy === email) continue;
    const previous = await prisma.adminUser.findUnique({ where: { email: legacy } });
    if (previous) {
      await prisma.adminUser.update({
        where: { id: previous.id },
        data: { email, passwordHash },
      });
    }
  }

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  const hygienist =
    (await prisma.job.findFirst({ where: { title: "Dental Hygienist" } })) ??
    (await prisma.job.create({
      data: {
        title: "Dental Hygienist",
        location: "Main clinic",
        jobSummary:
          "We are looking for a licensed dental hygienist to join our patient-focused practice. You will provide preventive care, educate patients, and collaborate with our dentists.",
        responsibilities:
          "- Provide preventive care and cleanings\n- Educate patients on oral health\n- Collaborate with dentists on treatment plans",
        requiredQualifications:
          "- Active state hygiene license\n- Current CPR certification\n- Comfortable with digital charting",
        preferredQualifications: "- Experience in a private practice setting",
        status: "published",
        publishedAt: new Date(),
        createdById: admin.id,
      },
    }));

  const assistant =
    (await prisma.job.findFirst({ where: { title: "Dental Assistant" } })) ??
    (await prisma.job.create({
      data: {
        title: "Dental Assistant",
        location: "Main clinic",
        jobSummary:
          "Support chairside procedures, keep operatories prepared, and help patients feel at ease from check-in to checkout.",
        responsibilities:
          "- Assist chairside during procedures\n- Prepare and sterilize operatories\n- Support patient check-in and checkout",
        requiredQualifications:
          "- 1+ year chairside experience preferred\n- Radiology certification a plus\n- Reliable weekday availability",
        preferredQualifications: "- Bilingual (English/Spanish)",
        status: "published",
        publishedAt: new Date(),
        createdById: admin.id,
      },
    }));

  const existingQuestions = await prisma.jobQuestion.count({ where: { jobId: hygienist.id } });
  if (existingQuestions === 0) {
    await prisma.jobQuestion.createMany({
      data: [
        {
          jobId: hygienist.id,
          prompt: "Why do you want to work here?",
          questionType: QuestionType.long_text,
          required: true,
          sortOrder: 0,
        },
        {
          jobId: hygienist.id,
          prompt: "Are you authorized to work in the United States?",
          questionType: QuestionType.yes_no,
          required: true,
          sortOrder: 1,
        },
        {
          jobId: assistant.id,
          prompt: "What days are you available?",
          questionType: QuestionType.short_text,
          required: true,
          sortOrder: 0,
        },
      ],
    });
  }

  const questions = await prisma.jobQuestion.findMany({
    where: { jobId: hygienist.id },
    orderBy: { sortOrder: "asc" },
  });

  const existingApp = await prisma.application.findFirst({
    where: { jobId: hygienist.id, email: "sample.applicant@example.com" },
  });

  if (!existingApp && questions.length > 0) {
    const application = await prisma.application.create({
      data: {
        jobId: hygienist.id,
        firstName: "Sample",
        lastName: "Applicant",
        email: "sample.applicant@example.com",
        phone: "555-0100",
        address: "123 Main St",
        zipCode: "10001",
        state: "NY",
        resumeKey: `applications/${hygienist.id}/placeholder/resume.pdf`,
      },
    });
    const key = `applications/${hygienist.id}/${application.id}/resume.pdf`;
    await s3().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET ?? "resumes",
        Key: key,
        Body: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"),
        ContentType: "application/pdf",
      }),
    );
    await prisma.application.update({
      where: { id: application.id },
      data: { resumeKey: key },
    });
    await prisma.applicationAnswer.createMany({
      data: questions.map((question) => ({
        applicationId: application.id,
        jobQuestionId: question.id,
        answerText:
          question.questionType === QuestionType.yes_no
            ? "yes"
            : "I want to grow with a community-focused practice.",
      })),
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
