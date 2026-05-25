import { Client as OpenSearchClient } from "@opensearch-project/opensearch";
import { Redis } from "ioredis";
import { Kafka, type Producer } from "kafkajs";
import type { CandidateProfileUpdatedEvent } from "@jobportal/domain";

const kafkaBrokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",").map((value) => value.trim());
const openSearch = new OpenSearchClient({ node: process.env.OPENSEARCH_NODE ?? "http://localhost:9200" });
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
const maxAttempts = Number(process.env.SOURCING_WORKER_MAX_ATTEMPTS ?? 5);

async function updateCandidateIndex(event: CandidateProfileUpdatedEvent): Promise<void> {
  await openSearch.update({
    index: "candidate_profiles_v1",
    id: event.payload.candidateUserId,
    body: {
      doc: {
        resumeS3Key: event.payload.resumeS3Key,
        resumeChecksum: event.payload.resumeChecksum,
        profileUpdatedAt: event.payload.profileUpdatedAt,
        profileEventVersion: event.version,
        resumeParseStatus: event.payload.resumeS3Key ? "PENDING" : "NOT_REQUIRED"
      },
      doc_as_upsert: true
    }
  });
}

async function evictSourcingCaches(candidateUserId: string): Promise<void> {
  await redis.incr("resdex:cache-version");

  const patterns = [`candidate:${candidateUserId}:*`];

  for (const pattern of patterns) {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 500);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  }
}

async function publishDlq(producer: Producer, event: CandidateProfileUpdatedEvent, error: unknown, attempts: number): Promise<void> {
  await producer.send({
    topic: "candidate-profile-events.dlq",
    messages: [
      {
        key: event.aggregateId,
        value: JSON.stringify({
          originalTopic: "candidate-profile-events",
          eventId: event.eventId,
          aggregateId: event.aggregateId,
          eventType: event.eventType,
          attempts,
          failureReason: error instanceof Error ? error.name : "UNKNOWN_ERROR",
          lastError: error instanceof Error ? error.message : String(error),
          failedAt: new Date().toISOString(),
          payload: event.payload
        })
      }
    ]
  });
}

async function processWithRetry(producer: Producer, event: CandidateProfileUpdatedEvent): Promise<void> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      attempts += 1;
      await updateCandidateIndex(event);
      await evictSourcingCaches(event.payload.candidateUserId);
      return;
    } catch (error) {
      if (attempts >= maxAttempts) {
        await publishDlq(producer, event, error, attempts);
        return;
      }

      const backoffMs = Math.min(30_000, 500 * 2 ** (attempts - 1));
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}

async function main(): Promise<void> {
  const kafka = new Kafka({ clientId: "sourcing-refresh-worker", brokers: kafkaBrokers });
  const consumer = kafka.consumer({ groupId: "sourcing-refresh-v1" });
  const producer = kafka.producer();

  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "candidate-profile-events", fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const event = JSON.parse(message.value.toString()) as CandidateProfileUpdatedEvent;
      if (event.eventType !== "candidate.profile.updated") return;

      await processWithRetry(producer, event);
    }
  });
}

await main();
