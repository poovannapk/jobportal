import { Pool } from "pg";
import type { CreateRecruiterJobRequest } from "@Placd/domain";
import type { CreatedJob, JobRepository } from "./ports.js";

export class PostgresJobRepository implements JobRepository {
  constructor(private readonly pool: Pool) {}

  async createJob(input: CreateRecruiterJobRequest): Promise<CreatedJob> {
    const status = input.publish ? "PUBLISHED" : "DRAFT";
    const result = await this.pool.query<{ id: string }>(
      `
        INSERT INTO job_postings (
          company_id,
          recruiter_user_id,
          title,
          description,
          employment_type,
          workplace_type,
          location_city,
          location_country,
          latitude,
          longitude,
          min_experience_months,
          max_experience_months,
          min_salary_lpa,
          max_salary_lpa,
          currency,
          required_skills,
          status,
          published_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16::jsonb, $17, CASE WHEN $17 = 'PUBLISHED' THEN now() ELSE NULL END
        )
        RETURNING id
      `,
      [
        input.tenant.companyId,
        input.tenant.recruiterUserId,
        input.title,
        input.description,
        input.employmentType,
        input.workplaceType,
        input.location.city,
        input.location.country,
        input.location.latitude ?? null,
        input.location.longitude ?? null,
        input.experience.minMonths,
        input.experience.maxMonths,
        input.salary?.minLpa ?? null,
        input.salary?.maxLpa ?? null,
        input.salary?.currency ?? "INR",
        JSON.stringify(input.requiredSkills),
        status
      ]
    );

    return { jobId: result.rows[0].id, status };
  }
}

export class InMemoryJobRepository implements JobRepository {
  async createJob(input: CreateRecruiterJobRequest): Promise<CreatedJob> {
    const { randomUUID } = await import("node:crypto");
    return {
      jobId: randomUUID(),
      status: input.publish ? "PUBLISHED" : "DRAFT"
    };
  }
}
