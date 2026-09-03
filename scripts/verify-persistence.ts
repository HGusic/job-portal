import { PrismaClient } from "@prisma/client";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

async function main() {
  const job = await prisma.job.findFirst({
    where: { status: "published" },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      applications: {
        include: { answers: { include: { jobQuestion: true } } },
      },
    },
  });

  if (!job) {
    throw new Error("No published job found. Run prisma db seed first.");
  }

  console.log(`Job: ${job.title} (${job.id})`);
  console.log(`Questions: ${job.questions.length}`);
  console.log(`Applications: ${job.applications.length}`);

  for (const application of job.applications) {
    console.log(`- ${application.firstName} ${application.lastName} <${application.email}> resume=${application.resumeKey}`);
    for (const answer of application.answers) {
      console.log(`    Q: ${answer.jobQuestion.prompt}`);
      console.log(`    A: ${answer.answerText}`);
    }

    const endpoint = process.env.S3_ENDPOINT;
    const s3 = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: endpoint || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true" || Boolean(endpoint),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      },
    });
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET ?? "resumes",
        Key: application.resumeKey,
      }),
    );
    const bytes = await object.Body?.transformToByteArray();
    console.log(`  Resume object bytes: ${bytes?.byteLength ?? 0}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
