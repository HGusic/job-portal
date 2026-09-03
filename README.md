# Job portal

Public job listings and applications for a dental practice. Applicants do not log in. An employer account creates, edits, and closes postings and custom questions.

## Local setup

1. Install **Node 20**.
2. Copy environment values:

```bash
cp .env.example .env
```

3. Start Postgres and MinIO:

```bash
docker compose up -d
```

4. Apply schema, generate the client, and seed sample data:

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run verify:data
```

5. Run the app:

```bash
npm run dev
```

Optional Lightsail-style check: `docker compose --profile app up --build`.

- Public jobs: http://localhost:3000
- Employer portal: http://admin.localhost:3000/admin/login  
  Seed credentials: `1@1` / `1`
  (`admin.localhost` points at your machine; bookmark this URL — it is not linked from the public site.)
- MinIO console: http://localhost:9001 (`minioadmin` / `minioadmin`)

Local Docker maps to AWS as: **Postgres → RDS**, **MinIO → S3**. The app talks to both through `DATABASE_URL` and the `S3_*` variables only.

## Move to AWS (env swap)

Same container and migrations. Do not change the data model.

1. Create an **RDS PostgreSQL 16** instance. Copy its connection URL into `DATABASE_URL`.
2. Create a private **S3** bucket (for example `practice-job-resumes`).
3. Create an IAM user or instance role with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on that bucket.
4. Launch the app on **Lightsail** (container or Node instance) or ECS Fargate using the included `Dockerfile`.
5. Set production env:

```
DATABASE_URL=postgresql://USER:PASSWORD@RDS_HOST:5432/jobportal?schema=public
S3_BUCKET=practice-job-resumes
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
# omit S3_ENDPOINT and S3_FORCE_PATH_STYLE so the AWS SDK uses real S3
NEXTAUTH_SECRET=<long random string>
NEXTAUTH_URL=https://admin.jobs.yourpractice.com
PUBLIC_APP_URL=https://jobs.yourpractice.com
ADMIN_APP_URL=https://admin.jobs.yourpractice.com
PRACTICE_NAME=Your Practice Name
```

6. On first boot the image runs `prisma migrate deploy`, then `next start`.
7. Point **two DNS names** at the same Lightsail instance (or load balancer) and terminate TLS for both. Example: `jobs.yourpractice.com` (public) and `admin.jobs.yourpractice.com` (employer). The app chooses UI and routes from the Host header.
8. Smoke-test: publish a job on the admin host, apply on the public host, confirm the row in RDS and the object in S3. Visiting `/admin` on the public host should 404.

Optional later: Amazon SES for application emails; Cognito instead of Credentials auth.
