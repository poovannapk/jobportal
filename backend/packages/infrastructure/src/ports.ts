import type {
  CreateRecruiterJobRequest,
  DomainEvent,
  ResdexCandidateHit,
  ResdexSearchRequest,
  SaveCandidateProfileRequest
} from "@Placd/domain";

export type CreatedJob = {
  jobId: string;
  status: "DRAFT" | "PUBLISHED";
};

export interface JobRepository {
  createJob(input: CreateRecruiterJobRequest): Promise<CreatedJob>;
}

export interface CandidateProfileRepository {
  saveProfile(candidateUserId: string, input: SaveCandidateProfileRequest, changedFields: string[]): Promise<void>;
}

export interface EventBus {
  publish(topic: string, event: DomainEvent<Record<string, unknown>>): Promise<void>;
}

export interface CacheStore {
  deletePattern(pattern: string): Promise<number>;
  increment(key: string): Promise<number>;
  setJson(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  getJson<T>(key: string): Promise<T | null>;
}

export type CandidateSearchResult = {
  total: number;
  page: number;
  pageSize: number;
  candidates: ResdexCandidateHit[];
};

export interface CandidateSearchEngine {
  searchCandidates(input: ResdexSearchRequest): Promise<CandidateSearchResult>;
}
