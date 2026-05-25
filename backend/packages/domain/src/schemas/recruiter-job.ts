import { z } from "zod";

export const tenantMetadataSchema = z.object({
  companyId: z.string().uuid(),
  recruiterUserId: z.string().uuid(),
  source: z.enum(["RECRUITER_PORTAL", "ATS_API", "BULK_IMPORT"]).default("RECRUITER_PORTAL")
});

export const skillRequirementSchema = z.object({
  name: z.string().trim().min(1).max(80),
  importance: z.enum(["MUST_HAVE", "NICE_TO_HAVE"]),
  minYears: z.number().min(0).max(40).optional()
});

export const createRecruiterJobSchema = z.object({
  tenant: tenantMetadataSchema,
  title: z.string().trim().min(4).max(180),
  description: z.string().trim().min(50).max(20_000),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  workplaceType: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
  location: z
    .object({
      city: z.string().trim().min(1).max(120),
      country: z.string().length(2).transform((value) => value.toUpperCase()),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    })
    .refine((value) => (value.latitude == null) === (value.longitude == null), {
      message: "latitude and longitude must be supplied together"
    }),
  experience: z
    .object({
      minMonths: z.number().int().min(0).max(720),
      maxMonths: z.number().int().min(0).max(720)
    })
    .refine((value) => value.maxMonths >= value.minMonths, {
      message: "maxMonths must be greater than or equal to minMonths"
    }),
  salary: z
    .object({
      minLpa: z.number().min(0).max(999.99).optional(),
      maxLpa: z.number().min(0).max(999.99).optional(),
      currency: z.string().length(3).transform((value) => value.toUpperCase()).default("INR")
    })
    .refine((value) => value.minLpa == null || value.maxLpa == null || value.maxLpa >= value.minLpa, {
      message: "maxLpa must be greater than or equal to minLpa"
    })
    .optional(),
  requiredSkills: z.array(skillRequirementSchema).min(1).max(40),
  publish: z.boolean().default(false)
});

export type CreateRecruiterJobRequest = z.infer<typeof createRecruiterJobSchema>;
