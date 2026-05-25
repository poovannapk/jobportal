import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { createContainer } from "./container.js";
import { loadConfig } from "./config.js";
import { errorHandler } from "./http/errors.js";
import { authContextPlugin } from "./http/plugins/auth-context.js";
import { registerJobseekerProfileRoutes } from "./modules/jobseeker/profile.routes.js";
import { registerRecruiterJobRoutes } from "./modules/recruiter/jobs.routes.js";
import { registerResdexRoutes } from "./modules/resdex/resdex.routes.js";

export async function buildServer() {
  const config = loadConfig();
  const container = createContainer(config);
  const fastify = Fastify({ logger: true });

  fastify.setErrorHandler(errorHandler);
  await fastify.register(cors, { origin: true });
  await fastify.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  await fastify.register(authContextPlugin);

  fastify.get("/health", async () => ({
    status: "ok",
    service: "api-gateway",
    time: new Date().toISOString()
  }));

  fastify.get("/", async () => ({
    service: "enterprise-Placd-api",
    status: "running",
    docs: "/openapi/Placd.v1.yaml",
    health: "/health",
    endpoints: ["/api/v1/recruiter/jobs", "/api/v1/resdex/search", "/api/v1/jobseeker/profile"]
  }));

  fastify.get("/favicon.ico", async (_request, reply) => reply.status(204).send());

  await registerJobseekerProfileRoutes(fastify, container);
  await registerRecruiterJobRoutes(fastify, container);
  await registerResdexRoutes(fastify, container);

  return { fastify, config };
}

const isEntrypoint = process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js");

if (isEntrypoint) {
  const { fastify, config } = await buildServer();
  await fastify.listen({ port: config.port, host: "0.0.0.0" });
}
