import { Kafka, type Producer } from "kafkajs";
import type { DomainEvent } from "@jobportal/domain";
import type { EventBus } from "./ports.js";

export class KafkaEventBus implements EventBus {
  private producer?: Producer;

  constructor(private readonly brokers: string[]) {}

  async publish(topic: string, event: DomainEvent<Record<string, unknown>>): Promise<void> {
    if (!this.producer) {
      this.producer = new Kafka({ clientId: "jobportal-api-gateway", brokers: this.brokers }).producer();
      await this.producer.connect();
    }

    await this.producer.send({
      topic,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            occurredAt: event.occurredAt
          }
        }
      ]
    });
  }
}

export class ConsoleEventBus implements EventBus {
  async publish(topic: string, event: DomainEvent<Record<string, unknown>>): Promise<void> {
    console.info(JSON.stringify({ topic, event }));
  }
}
