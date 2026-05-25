# Architecture

## Services

- API Gateway: JWT/OAuth boundary, rate limiting, tenant context, request validation, route composition.
- Job Seeker Hub: candidate profile, resume upload metadata, application tracking, profile refresh events.
- Recruiter SaaS / Resdex: job publishing, tenant isolation, credit ledger, boolean candidate search, RMS candidate pipeline.
- Enterprise Integration Engine: inbound ATS job ingestion and outbound candidate/application export through webhook workers.
- Sourcing Refresh Worker: consumes profile/resume events, updates OpenSearch sourcing index, evicts Redis candidate/search caches.

## Data Stores

- PostgreSQL: users, profiles, companies, jobs, applications, recruiter credit ledger.
- MongoDB: clickstream, notification history, audit trails.
- S3: resume blobs, parsed resume artifacts, company logos.
- OpenSearch: denormalized candidate profiles and active job postings.
- Redis: sessions, high-read search result windows, top jobs, active queues.
- Kafka: profile refresh, job publishing, application submission, ATS sync events.

## Sourcing Refresh Flow

1. Web client uploads a new resume or edits candidate profile fields.
2. API Gateway validates identity and tenant/user ownership.
3. Job Seeker service writes profile metadata to PostgreSQL and stores the resume blob in S3.
4. Service emits `candidate.profile.updated` to Kafka topic `candidate-profile-events`.
5. `backend/workers/sourcing-worker` consumes the event in group `sourcing-refresh-v1`.
6. Worker updates `candidate_profiles_v1` in OpenSearch with changed profile fields and resume parse state.
7. Worker evicts Redis keys `candidate:{candidateUserId}:*` and broad `resdex:*` cached result windows.
8. Resume parser can asynchronously publish a second event after AI parsing, repeating index update and cache eviction.

## Outbound ATS Sync Flow

1. Candidate clicks Apply on a job linked to Workday.
2. Application service creates `job_applications` row with status `APPLIED`.
3. Service publishes `job.application.submitted` to `job-application-events`.
4. `backend/workers/ats-sync-worker` consumes the event.
5. Worker transforms the candidate/application payload into the configured ATS JSON contract.
6. Worker sends an idempotent webhook request with `x-Placd-event-id`.
7. On success, the application row should be updated with Workday application identifiers.
8. On failure, Kafka retry/DLQ policy should preserve the event for replay and support exponential backoff.

## Scaling Notes

- Candidate and job search should read from OpenSearch, never from transactional tables.
- PostgreSQL tables are shaped for integrity and internal workflow state; OpenSearch documents are denormalized for query speed.
- Recruiter credits are ledger-based, so allocations, consumption, refunds, and expiry remain auditable.
- Resdex cache TTL is intentionally short because candidate freshness matters. Resume/profile writes evict cache windows aggressively.
- Tenant isolation is enforced at the gateway and must also be enforced in repositories/search filters for defense in depth.
