import { Kafka } from "kafkajs";

type ApplicationSubmittedEvent = {
  eventId: string;
  eventType: "job.application.submitted";
  aggregateId: string;
  occurredAt: string;
    payload: {
    applicationId: string;
    jobId: string;
    candidateUserId: string;
    companyId: string;
    atsProvider: "WORKDAY" | "GREENHOUSE" | "SUCCESSFACTORS";
    atsEndpoint: string;
    candidate: Record<string, unknown>;
    job?: Record<string, unknown>;
    resume?: Record<string, unknown>;
    employer?: Record<string, unknown>;
    coverNote?: string;
    correlationId?: string;
  };
};

async function sendToAts(event: ApplicationSubmittedEvent): Promise<void> {
  const response = await fetch(event.payload.atsEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-jobportal-event-id": event.eventId,
      "x-jobportal-timestamp": new Date().toISOString()
    },
    body: JSON.stringify({
      eventId: event.eventId,
      eventType: event.eventType,
      eventVersion: "2026-05-25",
      occurredAt: event.occurredAt,
      source: {
        system: "JOBPORTAL",
        environment: process.env.NODE_ENV ?? "development",
        correlationId: event.payload.correlationId
      },
      employer: {
        companyId: event.payload.companyId,
        atsProvider: event.payload.atsProvider,
        ...event.payload.employer
      },
      job: {
        jobPortalJobId: event.payload.jobId,
        ...event.payload.job
      },
      application: {
        jobPortalApplicationId: event.payload.applicationId,
        appliedAt: event.occurredAt,
        sourceChannel: "JOB_PORTAL_DIRECT_APPLY",
        coverNote: event.payload.coverNote
      },
      candidate: event.payload.candidate,
      resume: event.payload.resume
    })
  });

  if (!response.ok) {
    throw new Error(`ATS sync failed with ${response.status}`);
  }
}

async function main(): Promise<void> {
  const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",").map((value) => value.trim());
  const kafka = new Kafka({ clientId: "ats-sync-worker", brokers });
  const consumer = kafka.consumer({ groupId: "ats-sync-v1" });

  await consumer.connect();
  await consumer.subscribe({ topic: "job-application-events", fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString()) as ApplicationSubmittedEvent;
      if (event.eventType === "job.application.submitted" && event.payload.atsProvider === "WORKDAY") {
        await sendToAts(event);
      }
    }
  });
}

await main();
