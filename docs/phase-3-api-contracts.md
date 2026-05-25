# Phase 3: API Contracts and ATS Integrations

## 1. Recruiter Resdex Search

Endpoint:

```http
POST /api/v1/resdex/search
Authorization: Bearer <recruiter-jwt>
Content-Type: application/json
Idempotency-Key: 7e33c0f7-0d69-42aa-98cf-c7722aa3a12e
```

Request:

```json
{
  "tenant": {
    "companyId": "2b82f8df-93a0-47cf-8d35-57e492a67c01",
    "recruiterUserId": "0d3b2b1a-0e42-4127-9b07-cb0a7cd734fb"
  },
  "booleanQuery": {
    "queryString": "\"Java\" AND (\"Spring Boot\" OR Microservices) AND Kafka NOT \"manual testing\"",
    "must": ["Java", "Spring Boot"],
    "should": ["Kafka", "OpenSearch", "AWS"],
    "mustNot": ["manual testing", "BPO"],
    "searchFields": ["headline", "skills", "currentTitle", "resumeText", "searchableText"]
  },
  "experience": {
    "minMonths": 48,
    "maxMonths": 132
  },
  "noticePeriod": {
    "maxDays": 45,
    "includeServingNotice": true
  },
  "salaryExpectation": {
    "maxLpa": 60,
    "currency": "INR"
  },
  "location": {
    "city": "Bengaluru",
    "preferredCities": ["Bengaluru", "Hyderabad", "Pune"],
    "radiusKm": 35,
    "latitude": 12.971599,
    "longitude": 77.594566,
    "includeRemoteCandidates": true
  },
  "activity": {
    "lastActiveWithinDays": 30,
    "profileUpdatedWithinDays": 90
  },
  "education": {
    "degrees": ["B.Tech", "M.Tech", "MCA"],
    "institutes": ["IIT", "NIT", "BITS"]
  },
  "employment": {
    "currentCompanies": ["Flipkart", "Amazon", "Razorpay"],
    "excludeCompanies": ["Competitor X"],
    "employmentTypes": ["FULL_TIME"]
  },
  "recruiterControls": {
    "consumeProfileViewCredit": false,
    "hidePreviouslyContacted": true,
    "hideAlreadyAppliedToJobId": "6bb6f4bc-5154-4376-a8ac-5ab40a84fcca"
  },
  "pagination": {
    "page": 1,
    "pageSize": 25
  },
  "sort": {
    "field": "LAST_ACTIVE",
    "direction": "DESC"
  }
}
```

Success response:

```json
{
  "requestId": "req-88bb542d8b244e6e",
  "total": 1842,
  "page": 1,
  "pageSize": 25,
  "cache": "MISS",
  "credits": {
    "profileViewsConsumed": 0,
    "profileViewBalance": 3820,
    "searchesRemainingToday": 148
  },
  "facets": {
    "locations": [
      { "value": "Bengaluru", "count": 936 },
      { "value": "Hyderabad", "count": 274 }
    ],
    "experienceBands": [
      { "value": "4-6 years", "count": 621 },
      { "value": "6-10 years", "count": 887 }
    ],
    "noticePeriods": [
      { "value": "0-15 days", "count": 219 },
      { "value": "16-30 days", "count": 481 },
      { "value": "31-45 days", "count": 367 }
    ]
  },
  "candidates": [
    {
      "candidateUserId": "11111111-1111-4111-8111-111111111111",
      "profileSnapshotId": "snap-20260525-000001",
      "fullName": "Ajay Kumar",
      "headline": "Senior Java Backend Engineer",
      "currentTitle": "Senior Backend Engineer",
      "currentCompany": "Razorpay",
      "currentLocation": "Bengaluru",
      "preferredLocations": ["Bengaluru", "Hyderabad", "Remote"],
      "totalExperienceMonths": 96,
      "noticePeriodDays": 30,
      "currentCtcLpa": 28,
      "expectedCtcLpa": 42,
      "skills": [
        { "name": "Java", "years": 7, "level": "ADVANCED", "matched": true },
        { "name": "Kafka", "years": 4, "level": "INTERMEDIATE", "matched": true },
        { "name": "PostgreSQL", "years": 5, "level": "ADVANCED", "matched": false }
      ],
      "lastActiveAt": "2026-05-25T10:30:00.000Z",
      "profileUpdatedAt": "2026-05-24T18:11:00.000Z",
      "resumeAvailable": true,
      "contactStatus": "NOT_CONTACTED",
      "applicationStatusForJob": "NOT_APPLIED",
      "score": 87.4,
      "highlights": {
        "skills": ["<em>Java</em>", "<em>Kafka</em>"],
        "resumeText": ["built event-driven services using <em>Kafka</em> and Spring Boot"]
      }
    }
  ]
}
```

Validation error:

```json
{
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "path": "experience.maxMonths",
      "message": "maxMonths must be greater than or equal to minMonths"
    }
  ]
}
```

## 2. Outbound Workday ATS Webhook

Webhook request fired by the ATS sync worker:

```http
POST https://workday.customer.example.com/jobportal/applications
Content-Type: application/json
X-Jobportal-Event-Id: evt-7b29b71c-5ce0-42ad-91a4-f029ad2b8a20
X-Jobportal-Signature: sha256=<hmac>
X-Jobportal-Timestamp: 2026-05-25T10:35:21.000Z
```

Payload:

```json
{
  "eventId": "evt-7b29b71c-5ce0-42ad-91a4-f029ad2b8a20",
  "eventType": "job.application.submitted",
  "eventVersion": "2026-05-25",
  "occurredAt": "2026-05-25T10:35:21.000Z",
  "source": {
    "system": "JOBPORTAL",
    "environment": "production",
    "correlationId": "req-88bb542d8b244e6e"
  },
  "employer": {
    "companyId": "2b82f8df-93a0-47cf-8d35-57e492a67c01",
    "tenantSlug": "acme-technologies",
    "atsProvider": "WORKDAY",
    "workdayTenant": "acme"
  },
  "job": {
    "jobPortalJobId": "6bb6f4bc-5154-4376-a8ac-5ab40a84fcca",
    "workdayRequisitionId": "WD-REQ-2026-44891",
    "title": "Senior Backend Engineer",
    "location": {
      "city": "Bengaluru",
      "country": "IN",
      "workplaceType": "HYBRID"
    }
  },
  "application": {
    "jobPortalApplicationId": "9f5c96ea-7586-45be-a12d-18fba4e58f1a",
    "appliedAt": "2026-05-25T10:35:20.000Z",
    "sourceChannel": "JOB_PORTAL_DIRECT_APPLY",
    "coverNote": "Interested in backend platform roles focused on distributed systems.",
    "consent": {
      "candidateDataSharingAccepted": true,
      "acceptedAt": "2026-05-25T10:35:15.000Z",
      "privacyPolicyVersion": "2026-01"
    }
  },
  "candidate": {
    "candidateUserId": "11111111-1111-4111-8111-111111111111",
    "fullName": "Ajay Kumar",
    "email": "ajay.kumar@example.com",
    "phoneE164": "+919876543210",
    "headline": "Senior Java Backend Engineer",
    "currentTitle": "Senior Backend Engineer",
    "currentCompany": "Razorpay",
    "currentLocation": "Bengaluru",
    "preferredLocations": ["Bengaluru", "Hyderabad", "Remote"],
    "totalExperienceMonths": 96,
    "noticePeriodDays": 30,
    "currentCtc": {
      "amountLpa": 28,
      "currency": "INR"
    },
    "expectedCtc": {
      "amountLpa": 42,
      "currency": "INR"
    },
    "skills": [
      { "name": "Java", "years": 7, "level": "ADVANCED" },
      { "name": "Kafka", "years": 4, "level": "INTERMEDIATE" },
      { "name": "PostgreSQL", "years": 5, "level": "ADVANCED" }
    ],
    "education": [
      {
        "degree": "B.Tech",
        "specialization": "Computer Science",
        "institute": "NIT Trichy",
        "graduationYear": 2018
      }
    ],
    "experience": [
      {
        "company": "Razorpay",
        "title": "Senior Backend Engineer",
        "startDate": "2021-07-01",
        "endDate": null,
        "currentlyWorking": true,
        "summary": "Built high-volume payment platform services."
      }
    ]
  },
  "resume": {
    "fileName": "Ajay_Kumar_Resume.pdf",
    "contentType": "application/pdf",
    "sizeBytes": 348921,
    "s3ObjectKey": "resumes/11111111-1111-4111-8111-111111111111/2026/05/resume.pdf",
    "downloadUrl": "https://jobportal-resumes.s3.amazonaws.com/resumes/11111111-1111-4111-8111-111111111111/2026/05/resume.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=900",
    "downloadUrlExpiresAt": "2026-05-25T10:50:21.000Z",
    "checksumSha256": "6f2d8c9a7a0b5c4e5bfb2e9e1a6d88a2d8dbdbebcf438f119f5aeb3d2fd0a777"
  }
}
```

Expected Workday acknowledgement:

```json
{
  "status": "ACCEPTED",
  "workdayCandidateId": "WD-CAND-774192",
  "workdayApplicationId": "WD-APP-991827",
  "receivedAt": "2026-05-25T10:35:23.000Z"
}
```

