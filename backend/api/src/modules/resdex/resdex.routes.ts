import type { FastifyInstance } from "fastify";
import { resdexSearchSchema } from "@Placd/domain";
import type { AppContainer } from "../../container.js";

export async function registerResdexRoutes(fastify: FastifyInstance, container: AppContainer): Promise<void> {
  fastify.post("/api/v1/resdex/search", async (request, reply) => {
    const input = resdexSearchSchema.parse(request.body);

    if (request.authContext.companyId && request.authContext.companyId !== input.tenant.companyId) {
      return reply.status(403).send({
        error: "TENANT_MISMATCH",
        message: "Authenticated company context does not match request tenant"
      });
    }

    const cacheVersion = (await container.cache.getJson<number>("resdex:cache-version")) ?? 0;
    const cacheKey = `resdex:v${cacheVersion}:${input.tenant.companyId}:${Buffer.from(JSON.stringify(input)).toString("base64url")}`;
    const cached = await container.cache.getJson<Awaited<ReturnType<typeof container.candidateSearch.searchCandidates>>>(cacheKey);
    if (cached) {
      return reply.send({ ...cached, cache: "HIT" });
    }

    const result = await container.candidateSearch.searchCandidates(input);
    await container.cache.setJson(cacheKey, result, 60);

    return reply.send({ ...result, cache: "MISS" });
  });
}
