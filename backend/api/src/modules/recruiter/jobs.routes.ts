import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { createRecruiterJobSchema, type JobPostingCreatedEvent } from "@jobportal/domain";
import type { AppContainer } from "../../container.js";

export async function registerRecruiterJobRoutes(fastify: FastifyInstance, container: AppContainer): Promise<void> {
  fastify.post("/api/v1/recruiter/jobs", async (request, reply) => {
    const input = createRecruiterJobSchema.parse(request.body);

    if (request.authContext.companyId && request.authContext.companyId !== input.tenant.companyId) {
      return reply.status(403).send({
        error: "TENANT_MISMATCH",
        message: "Authenticated company context does not match request tenant"
      });
    }

    const created = await container.jobs.createJob(input);
    const event: JobPostingCreatedEvent = {
      eventId: randomUUID(),
      eventType: "job.posting.created",
      aggregateId: created.jobId,
      occurredAt: new Date().toISOString(),
      version: 1,
      payload: {
        jobId: created.jobId,
        companyId: input.tenant.companyId,
        recruiterUserId: input.tenant.recruiterUserId,
        publish: input.publish
      }
    };

    await container.events.publish("job-posting-events", event);

    if (input.publish) {
      await container.cache.deletePattern(`jobs:top:${input.location.city}:*`);
      await container.cache.deletePattern(`company:${input.tenant.companyId}:jobs:*`);
    }

    return reply.status(201).send({
      jobId: created.jobId,
      status: created.status,
      events: [event.eventType]
    });
  });
}
