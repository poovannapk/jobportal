export type DomainEvent<TPayload extends Record<string, unknown>> = {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: string;
  version: number;
  payload: TPayload;
};

export type JobPostingCreatedEvent = DomainEvent<{
  jobId: string;
  companyId: string;
  recruiterUserId: string;
  publish: boolean;
}>;

export type CandidateProfileUpdatedEvent = DomainEvent<{
  candidateUserId: string;
  resumeS3Key?: string;
  resumeChecksum?: string;
  changedFields: string[];
  profileUpdatedAt: string;
}>;
