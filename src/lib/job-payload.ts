import { z } from "zod";

export const jobPayloadSchema = z.object({
  title: z.string().trim().max(200).default(""),
  location: z.string().trim().max(200).default(""),
  jobSummary: z.string().trim().default(""),
  responsibilities: z.string().trim().default(""),
  requiredQualifications: z.string().trim().default(""),
  preferredQualifications: z.string().trim().default(""),
  includeTitle: z.boolean().default(true),
  includeLocation: z.boolean().default(true),
  includeJobSummary: z.boolean().default(true),
  includeResponsibilities: z.boolean().default(true),
  includeRequiredQualifications: z.boolean().default(true),
  includePreferredQualifications: z.boolean().default(true),
  status: z.enum(["draft", "published", "closed"]),
});

export type JobPayload = z.infer<typeof jobPayloadSchema>;
