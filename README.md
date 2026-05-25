# Enterprise Job Portal

Scaffold for a high-scale dual-sided job marketplace with recruiter SaaS, candidate search, asynchronous sourcing refresh, and ATS sync boundaries.

## Project Structure

```text
backend/
  api/                 Fastify API gateway with recruiter, candidate, and Resdex routes
  workers/
    outbox-publisher/  PostgreSQL transactional outbox relay to Kafka
    sourcing-worker/   Kafka consumer for resume/profile refresh into OpenSearch
    ats-sync-worker/   Kafka consumer for outbound ATS application sync
  packages/
    domain/            Zod contracts, request types, domain event types
    infrastructure/    Postgres, Kafka, Redis, and OpenSearch adapters
frontend/              Vite React job portal UI
db/
  postgres/            Transactional schema
  mongodb/             Candidate clickstream document schema
openapi/               REST API contract
docs/                  Architecture and flow notes
```

## Run Locally

```bash
npm install
npm run dev:api
npm run dev:web
```

By default `ENABLE_EXTERNAL_ADAPTERS=false`, so the API runs with in-memory/stub adapters. To use Postgres, Redis, Kafka, and OpenSearch:

```bash
docker compose up -d
copy .env.example .env
# set ENABLE_EXTERNAL_ADAPTERS=true in .env
npm run dev:api
```

Health check:

```bash
curl http://localhost:8080/health
```

## Implemented Endpoints

- `POST /api/v1/recruiter/jobs`
- `POST /api/v1/resdex/search`

See [openapi/jobportal.v1.yaml](openapi/jobportal.v1.yaml) for full payload contracts.
