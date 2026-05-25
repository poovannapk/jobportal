import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { CandidateProfileUpdatedEvent, SaveCandidateProfileRequest } from "@jobportal/domain";
import type { CandidateProfileRepository } from "./ports.js";

export class PostgresCandidateProfileRepository implements CandidateProfileRepository {
  constructor(private readonly pool: Pool) {}

  async saveProfile(candidateUserId: string, input: SaveCandidateProfileRequest, changedFields: string[]): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
          UPDATE user_profiles
          SET
            full_name = COALESCE($2, full_name),
            headline = COALESCE($3, headline),
            current_title = COALESCE($4, current_title),
            current_company = COALESCE($5, current_company),
            total_experience_months = COALESCE($6, total_experience_months),
            current_ctc_lpa = COALESCE($7, current_ctc_lpa),
            expected_ctc_lpa = COALESCE($8, expected_ctc_lpa),
            notice_period_days = COALESCE($9, notice_period_days),
            current_location = COALESCE($10, current_location),
            preferred_locations = COALESCE($11, preferred_locations),
            skills = COALESCE($12::jsonb, skills),
            resume_s3_key = COALESCE($13, resume_s3_key),
            resume_checksum = COALESCE($14, resume_checksum),
            updated_at = now()
          WHERE user_id = $1
        `,
        [
          candidateUserId,
          input.fullName ?? null,
          input.headline ?? null,
          input.currentTitle ?? null,
          input.currentCompany ?? null,
          input.totalExperienceMonths ?? null,
          input.currentCtcLpa ?? null,
          input.expectedCtcLpa ?? null,
          input.noticePeriodDays ?? null,
          input.currentLocation ?? null,
          input.preferredLocations ?? null,
          input.skills ? JSON.stringify(input.skills) : null,
          input.resumeS3Key ?? null,
          input.resumeChecksum ?? null
        ]
      );

      const event: CandidateProfileUpdatedEvent = {
        eventId: randomUUID(),
        eventType: "candidate.profile.updated",
        aggregateId: candidateUserId,
        occurredAt: new Date().toISOString(),
        version: 1,
        payload: {
          candidateUserId,
          resumeS3Key: input.resumeS3Key,
          resumeChecksum: input.resumeChecksum,
          changedFields,
          profileUpdatedAt: new Date().toISOString()
        }
      };

      await client.query(
        `
          INSERT INTO outbox_events (
            id,
            aggregate_type,
            aggregate_id,
            event_type,
            event_version,
            payload,
            status
          )
          VALUES ($1, 'candidate_profile', $2, $3, $4, $5::jsonb, 'PENDING')
        `,
        [event.eventId, candidateUserId, event.eventType, event.version, JSON.stringify(event)]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export class InMemoryCandidateProfileRepository implements CandidateProfileRepository {
  async saveProfile(): Promise<void> {
    return;
  }
}
