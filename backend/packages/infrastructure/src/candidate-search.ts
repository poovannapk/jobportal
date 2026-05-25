import { Client } from "@opensearch-project/opensearch";
import type { ResdexSearchRequest } from "@Placd/domain";
import type { CandidateSearchEngine, CandidateSearchResult } from "./ports.js";

export class OpenSearchCandidateSearchEngine implements CandidateSearchEngine {
  constructor(private readonly client: Client) {}

  async searchCandidates(input: ResdexSearchRequest): Promise<CandidateSearchResult> {
    const from = (input.pagination.page - 1) * input.pagination.pageSize;
    const sortField = {
      LAST_ACTIVE: "lastActiveAt",
      EXPERIENCE: "totalExperienceMonths",
      PROFILE_UPDATED: "profileUpdatedAt"
    }[input.sort.field];

    const filter: Record<string, unknown>[] = [];
    if (input.experience?.minMonths != null || input.experience?.maxMonths != null) {
      filter.push({
        range: {
          totalExperienceMonths: {
            gte: input.experience.minMonths,
            lte: input.experience.maxMonths
          }
        }
      });
    }
    if (input.noticePeriodMaxDays != null) {
      filter.push({ range: { noticePeriodDays: { lte: input.noticePeriodMaxDays } } });
    }
    if (input.salaryExpectation?.maxLpa != null) {
      filter.push({ range: { expectedCtcLpa: { lte: input.salaryExpectation.maxLpa } } });
    }
    if (input.location?.city) {
      filter.push({ term: { "currentLocation.keyword": input.location.city } });
    }
    if (input.location?.latitude != null && input.location.longitude != null && input.location.radiusKm != null) {
      filter.push({
        geo_distance: {
          distance: `${input.location.radiusKm}km`,
          geoPoint: { lat: input.location.latitude, lon: input.location.longitude }
        }
      });
    }

    const response = await this.client.search({
      index: "candidate_profiles_v1",
      body: {
        from,
        size: input.pagination.pageSize,
        track_total_hits: true,
        query: {
          bool: {
            must: input.booleanQuery.must.map((term) => ({ match: { searchableText: { query: term, operator: "and" } } })),
            should: input.booleanQuery.should.map((term) => ({ match: { searchableText: term } })),
            must_not: input.booleanQuery.mustNot.map((term) => ({ match: { searchableText: term } })),
            filter
          }
        },
        sort: [{ [sortField]: { order: input.sort.direction.toLowerCase() } }, "_score"]
      }
    });

    const body = response.body as {
      hits: {
        total: { value: number };
        hits: Array<{ _score: number; _source: Record<string, unknown> }>;
      };
    };

    return {
      total: body.hits.total.value,
      page: input.pagination.page,
      pageSize: input.pagination.pageSize,
      candidates: body.hits.hits.map((hit) => ({
        candidateUserId: String(hit._source.candidateUserId),
        fullName: String(hit._source.fullName),
        currentTitle: hit._source.currentTitle ? String(hit._source.currentTitle) : undefined,
        currentLocation: hit._source.currentLocation ? String(hit._source.currentLocation) : undefined,
        totalExperienceMonths: Number(hit._source.totalExperienceMonths ?? 0),
        lastActiveAt: hit._source.lastActiveAt ? String(hit._source.lastActiveAt) : undefined,
        score: hit._score
      }))
    };
  }
}

export class StubCandidateSearchEngine implements CandidateSearchEngine {
  async searchCandidates(input: ResdexSearchRequest): Promise<CandidateSearchResult> {
    return {
      total: 1,
      page: input.pagination.page,
      pageSize: input.pagination.pageSize,
      candidates: [
        {
          candidateUserId: "11111111-1111-4111-8111-111111111111",
          fullName: "Sample Candidate",
          currentTitle: "Senior Backend Engineer",
          currentLocation: input.location?.city ?? "Bengaluru",
          totalExperienceMonths: input.experience?.minMonths ?? 72,
          lastActiveAt: new Date().toISOString(),
          score: 87.4
        }
      ]
    };
  }
}
