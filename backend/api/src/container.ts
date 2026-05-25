import { Client as OpenSearchClient } from "@opensearch-project/opensearch";
import { Redis } from "ioredis";
import { Pool } from "pg";
import {
  ConsoleEventBus,
  InMemoryCandidateProfileRepository,
  InMemoryCacheStore,
  InMemoryJobRepository,
  KafkaEventBus,
  OpenSearchCandidateSearchEngine,
  PostgresCandidateProfileRepository,
  PostgresJobRepository,
  RedisCacheStore,
  StubCandidateSearchEngine,
  type CacheStore,
  type CandidateSearchEngine,
  type CandidateProfileRepository,
  type EventBus,
  type JobRepository
} from "@Placd/infrastructure";
import type { AppConfig } from "./config.js";

export type AppContainer = {
  jobs: JobRepository;
  candidateProfiles: CandidateProfileRepository;
  events: EventBus;
  cache: CacheStore;
  candidateSearch: CandidateSearchEngine;
};

export function createContainer(config: AppConfig): AppContainer {
  if (!config.enableExternalAdapters) {
    return {
      jobs: new InMemoryJobRepository(),
      candidateProfiles: new InMemoryCandidateProfileRepository(),
      events: new ConsoleEventBus(),
      cache: new InMemoryCacheStore(),
      candidateSearch: new StubCandidateSearchEngine()
    };
  }

  const pool = new Pool({ connectionString: config.databaseUrl });

  return {
    jobs: new PostgresJobRepository(pool),
    candidateProfiles: new PostgresCandidateProfileRepository(pool),
    events: new KafkaEventBus(config.kafkaBrokers),
    cache: new RedisCacheStore(new Redis(config.redisUrl)),
    candidateSearch: new OpenSearchCandidateSearchEngine(new OpenSearchClient({ node: config.openSearchNode }))
  };
}
