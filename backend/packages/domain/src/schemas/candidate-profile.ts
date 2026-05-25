import { z } from "zod";

export const candidateSkillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  years: z.number().min(0).max(50).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional()
});

export const saveCandidateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(160).optional(),
  headline: z.string().trim().min(2).max(220).optional(),
  currentTitle: z.string().trim().min(1).max(160).optional(),
  currentCompany: z.string().trim().min(1).max(180).optional(),
  totalExperienceMonths: z.number().int().min(0).max(720).optional(),
  currentCtcLpa: z.number().min(0).max(999.99).optional(),
  expectedCtcLpa: z.number().min(0).max(999.99).optional(),
  noticePeriodDays: z.number().int().min(0).max(365).optional(),
  currentLocation: z.string().trim().min(1).max(120).optional(),
  preferredLocations: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  skills: z.array(candidateSkillSchema).min(1).max(80).optional(),
  resumeS3Key: z.string().trim().min(1).max(1024).optional(),
  resumeChecksum: z.string().trim().min(16).max(96).optional()
});

export type SaveCandidateProfileRequest = z.infer<typeof saveCandidateProfileSchema>;
