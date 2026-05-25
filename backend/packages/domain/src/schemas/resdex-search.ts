import { z } from "zod";
import { tenantMetadataSchema } from "./recruiter-job.js";

export const resdexSearchSchema = z
  .object({
    tenant: tenantMetadataSchema.omit({ source: true }).extend({
      source: tenantMetadataSchema.shape.source.optional()
    }),
    booleanQuery: z.object({
      must: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
      should: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
      mustNot: z.array(z.string().trim().min(1).max(120)).max(30).default([])
    }),
    experience: z
      .object({
        minMonths: z.number().int().min(0).max(720).optional(),
        maxMonths: z.number().int().min(0).max(720).optional()
      })
      .refine((value) => value.minMonths == null || value.maxMonths == null || value.maxMonths >= value.minMonths, {
        message: "maxMonths must be greater than or equal to minMonths"
      })
      .optional(),
    location: z
      .object({
        city: z.string().trim().min(1).max(120).optional(),
        radiusKm: z.number().int().min(1).max(250).optional(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional()
      })
      .refine((value) => (value.latitude == null) === (value.longitude == null), {
        message: "latitude and longitude must be supplied together"
      })
      .optional(),
    noticePeriodMaxDays: z.number().int().min(0).max(365).optional(),
    salaryExpectation: z
      .object({
        maxLpa: z.number().min(0).max(999.99),
        currency: z.string().length(3).transform((value) => value.toUpperCase()).default("INR")
      })
      .optional(),
    pagination: z.object({
      page: z.number().int().min(1),
      pageSize: z.number().int().min(1).max(100)
    }),
    sort: z
      .object({
        field: z.enum(["LAST_ACTIVE", "EXPERIENCE", "PROFILE_UPDATED"]).default("LAST_ACTIVE"),
        direction: z.enum(["ASC", "DESC"]).default("DESC")
      })
      .default({ field: "LAST_ACTIVE", direction: "DESC" })
  })
  .refine((value) => value.booleanQuery.must.length + value.booleanQuery.should.length > 0, {
    message: "At least one must or should boolean term is required"
  });

export type ResdexSearchRequest = z.infer<typeof resdexSearchSchema>;

export type ResdexCandidateHit = {
  candidateUserId: string;
  fullName: string;
  currentTitle?: string;
  currentLocation?: string;
  totalExperienceMonths: number;
  lastActiveAt?: string;
  score: number;
};
