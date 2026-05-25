import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function errorHandler(error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof ZodError) {
    void reply.status(400).send({
      error: "VALIDATION_ERROR",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  const statusCode = "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
  void reply.status(statusCode).send({
    error: statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
    message: statusCode >= 500 ? "Unexpected server error" : error.message
  });
}
