import { Kafka } from "kafkajs";
import { Pool } from "pg";

type OutboxRow = {
  id: string;
  aggregate_id: string;
  event_type: string;
  payload: Record<string, unknown>;
};

const databaseUrl = process.env.DATABASE_URL ?? "postgres://jobportal:jobportal@localhost:5432/jobportal";
const kafkaBrokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",").map((value) => value.trim());
const pollIntervalMs = Number(process.env.OUTBOX_POLL_INTERVAL_MS ?? 1000);
const batchSize = Number(process.env.OUTBOX_BATCH_SIZE ?? 250);

function topicForEvent(eventType: string): string {
  if (eventType.startsWith("candidate.profile.")) return "candidate-profile-events";
  if (eventType.startsWith("job.posting.")) return "job-posting-events";
  if (eventType.startsWith("job.application.")) return "job-application-events";
  return "domain-events";
}

async function publishBatch(pool: Pool, producer: Awaited<ReturnType<Kafka["producer"]>>): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query<OutboxRow>(
      `
        SELECT id, aggregate_id, event_type, payload
        FROM outbox_events
        WHERE status = 'PENDING'
        ORDER BY created_at, id
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      `,
      [batchSize]
    );

    for (const row of result.rows) {
      try {
        await producer.send({
          topic: topicForEvent(row.event_type),
          messages: [
            {
              key: row.aggregate_id,
              value: JSON.stringify(row.payload),
              headers: {
                eventType: row.event_type,
                outboxId: row.id
              }
            }
          ]
        });

        await client.query(
          "UPDATE outbox_events SET status = 'PUBLISHED', published_at = now(), attempts = attempts + 1 WHERE id = $1",
          [row.id]
        );
      } catch (error) {
        await client.query(
          "UPDATE outbox_events SET attempts = attempts + 1, last_error = $2 WHERE id = $1",
          [row.id, error instanceof Error ? error.message : String(error)]
        );
      }
    }

    await client.query("COMMIT");
    return result.rowCount ?? 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  const kafka = new Kafka({ clientId: "outbox-publisher", brokers: kafkaBrokers });
  const producer = kafka.producer();
  await producer.connect();

  for (;;) {
    const published = await publishBatch(pool, producer);
    if (published === 0) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }
}

await main();
