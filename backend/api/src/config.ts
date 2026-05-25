export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  kafkaBrokers: string[];
  openSearchNode: string;
  enableExternalAdapters: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    nodeEnv: env.NODE_ENV ?? "development",
    port: Number(env.PORT ?? 8080),
    databaseUrl: env.DATABASE_URL ?? "postgres://Placd:Placd@localhost:5432/Placd",
    redisUrl: env.REDIS_URL ?? "redis://localhost:6379",
    kafkaBrokers: (env.KAFKA_BROKERS ?? "localhost:9092").split(",").map((value) => value.trim()),
    openSearchNode: env.OPENSEARCH_NODE ?? "http://localhost:9200",
    enableExternalAdapters: env.ENABLE_EXTERNAL_ADAPTERS === "true"
  };
}
