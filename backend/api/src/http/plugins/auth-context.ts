import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    authContext: {
      subject: string;
      companyId?: string;
      scopes: string[];
    };
  }
}

export const authContextPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook("preHandler", async (request) => {
    const subject = request.headers["x-user-id"];
    const companyId = request.headers["x-company-id"];
    const scopes = request.headers["x-scopes"];

    request.authContext = {
      subject: Array.isArray(subject) ? subject[0] : subject ?? "anonymous",
      companyId: Array.isArray(companyId) ? companyId[0] : companyId,
      scopes: typeof scopes === "string" ? scopes.split(" ") : []
    };
  });
});
