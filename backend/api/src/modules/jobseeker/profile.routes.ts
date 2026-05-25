import type { FastifyInstance } from "fastify";
import { saveCandidateProfileSchema } from "@Placd/domain";
import type { AppContainer } from "../../container.js";

export async function registerJobseekerProfileRoutes(fastify: FastifyInstance, container: AppContainer): Promise<void> {
  fastify.put("/api/v1/jobseeker/profile", async (request, reply) => {
    const input = saveCandidateProfileSchema.parse(request.body);
    const candidateUserId = request.authContext.subject;

    if (candidateUserId === "anonymous") {
      return reply.status(401).send({
        error: "UNAUTHENTICATED",
        message: "Candidate authentication is required"
      });
    }

    const changedFields = Object.keys(input);
    await container.candidateProfiles.saveProfile(candidateUserId, input, changedFields);

    await container.cache.deletePattern(`candidate:${candidateUserId}:*`);
    const resdexCacheVersion = await container.cache.increment("resdex:cache-version");

    return reply.send({
      status: "SAVED",
      candidateUserId,
      changedFields,
      cacheInvalidation: {
        candidateKeys: `candidate:${candidateUserId}:*`,
        resdexCacheVersion
      }
    });
  });
}
