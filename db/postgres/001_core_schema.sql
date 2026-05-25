CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('JOB_SEEKER', 'RECRUITER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'EXPIRED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE credit_ledger_type AS ENUM ('ALLOCATED', 'CONSUMED', 'REFUNDED', 'EXPIRED', 'TRANSFERRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  phone_e164 VARCHAR(20),
  password_hash TEXT,
  role user_role NOT NULL,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT users_phone_format_chk CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$')
);

CREATE INDEX IF NOT EXISTS idx_users_role_last_active ON users (role, last_active_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone_e164) WHERE phone_e164 IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(160) NOT NULL,
  headline VARCHAR(220),
  current_title VARCHAR(160),
  current_company VARCHAR(180),
  total_experience_months INTEGER NOT NULL DEFAULT 0,
  current_ctc_lpa NUMERIC(8,2),
  expected_ctc_lpa NUMERIC(8,2),
  notice_period_days INTEGER,
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  current_location VARCHAR(120),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  resume_s3_key TEXT,
  resume_checksum VARCHAR(96),
  resume_parsed_at TIMESTAMPTZ,
  profile_completion_score SMALLINT NOT NULL DEFAULT 0,
  searchable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_experience_chk CHECK (total_experience_months BETWEEN 0 AND 720),
  CONSTRAINT user_profiles_ctc_chk CHECK (
    (current_ctc_lpa IS NULL OR current_ctc_lpa >= 0) AND
    (expected_ctc_lpa IS NULL OR expected_ctc_lpa >= 0)
  ),
  CONSTRAINT user_profiles_notice_chk CHECK (notice_period_days IS NULL OR notice_period_days BETWEEN 0 AND 365),
  CONSTRAINT user_profiles_completion_chk CHECK (profile_completion_score BETWEEN 0 AND 100),
  CONSTRAINT user_profiles_geo_pair_chk CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_profiles_active_location ON user_profiles (current_location, updated_at DESC) WHERE searchable = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_exp_location ON user_profiles (total_experience_months, current_location) WHERE searchable = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin ON user_profiles USING GIN (skills jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_locations_gin ON user_profiles USING GIN (preferred_locations);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_company_id UUID REFERENCES companies(id) ON DELETE RESTRICT,
  legal_name VARCHAR(220) NOT NULL,
  display_name VARCHAR(180) NOT NULL,
  domain CITEXT,
  industry VARCHAR(120),
  employee_count_min INTEGER,
  employee_count_max INTEGER,
  headquarters_location VARCHAR(160),
  logo_s3_key TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  tenant_slug VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT companies_employee_range_chk CHECK (
    employee_count_min IS NULL OR employee_count_max IS NULL OR employee_count_min <= employee_count_max
  )
);

CREATE INDEX IF NOT EXISTS idx_companies_parent ON companies (parent_company_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies (domain) WHERE domain IS NOT NULL;

CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  recruiter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  external_ats_job_id VARCHAR(160),
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  employment_type VARCHAR(40) NOT NULL,
  workplace_type VARCHAR(40) NOT NULL,
  location_city VARCHAR(120) NOT NULL,
  location_country CHAR(2) NOT NULL DEFAULT 'IN',
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  min_experience_months INTEGER NOT NULL DEFAULT 0,
  max_experience_months INTEGER NOT NULL,
  min_salary_lpa NUMERIC(8,2),
  max_salary_lpa NUMERIC(8,2),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  status job_status NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT job_experience_range_chk CHECK (min_experience_months >= 0 AND max_experience_months >= min_experience_months),
  CONSTRAINT job_salary_range_chk CHECK (
    min_salary_lpa IS NULL OR max_salary_lpa IS NULL OR (min_salary_lpa >= 0 AND max_salary_lpa >= min_salary_lpa)
  ),
  CONSTRAINT job_geo_pair_chk CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL)),
  CONSTRAINT job_external_unique UNIQUE (company_id, external_ats_job_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_published ON job_postings (status, published_at DESC, expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON job_postings (company_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location_exp_salary ON job_postings (location_city, min_experience_months, max_experience_months, max_salary_lpa DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_required_skills_gin ON job_postings USING GIN (required_skills jsonb_path_ops);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE RESTRICT,
  candidate_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  status application_status NOT NULL DEFAULT 'APPLIED',
  cover_note TEXT,
  resume_s3_key TEXT,
  source VARCHAR(40) NOT NULL DEFAULT 'DIRECT',
  external_ats_candidate_id VARCHAR(160),
  external_ats_application_id VARCHAR(160),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_user_id)
);

CREATE INDEX IF NOT EXISTS idx_app_candidate_status ON job_applications (candidate_user_id, status, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_company_status_applied ON job_applications (company_id, status, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_job_status ON job_applications (job_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS recruiter_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  recruiter_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  credit_type VARCHAR(40) NOT NULL,
  ledger_type credit_ledger_type NOT NULL,
  units INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recruiter_credits_units_chk CHECK (units <> 0),
  CONSTRAINT recruiter_credits_balance_chk CHECK (balance_after >= 0)
);

CREATE INDEX IF NOT EXISTS idx_credits_company_type_created ON recruiter_credits (company_id, credit_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_recruiter_type_created ON recruiter_credits (recruiter_user_id, credit_type, created_at DESC) WHERE recruiter_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_credits_expiry ON recruiter_credits (expires_at) WHERE expires_at IS NOT NULL;

DO $$ BEGIN
  CREATE TYPE outbox_status AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(80) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  event_version INTEGER NOT NULL DEFAULT 1,
  payload JSONB NOT NULL,
  status outbox_status NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  CONSTRAINT outbox_attempts_chk CHECK (attempts >= 0)
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending_created ON outbox_events (created_at, id) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events (aggregate_type, aggregate_id, created_at DESC);
