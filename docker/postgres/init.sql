CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE DATABASE umami;

-- Masamune app tables
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE site_status AS ENUM ('drafting', 'generating', 'live', 'partial', 'error');
CREATE TYPE job_type AS ENUM ('generate', 'rebuild', 'domain_purchase', 'dns_config', 'seo_submit');
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TYPE domain_status AS ENUM ('searching', 'purchased', 'dns_configured', 'ssl_active', 'error');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');
CREATE TYPE asset_type AS ENUM ('image', 'video', 'logo');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE channel_type AS ENUM ('whatsapp', 'telegram', 'discord');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  plan plan_type DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  brief_json JSONB,
  status site_status DEFAULT 'drafting',
  error_message TEXT,
  code_storage_path TEXT,
  current_version INT DEFAULT 1,
  seo_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  code_storage_path TEXT NOT NULL,
  brief_json_snapshot JSONB,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, version_number)
);

CREATE TABLE site_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  original_url TEXT NOT NULL,
  optimized_url TEXT,
  alt_text TEXT
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  brief_extracted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  registrar TEXT DEFAULT 'ovh',
  status domain_status DEFAULT 'searching',
  expires_at TIMESTAMPTZ,
  stripe_payment_id TEXT,
  ovh_order_id TEXT
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type job_type NOT NULL,
  status job_status DEFAULT 'queued',
  payload JSONB,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  plan plan_type NOT NULL,
  status subscription_status DEFAULT 'active',
  current_period_end TIMESTAMPTZ NOT NULL
);

CREATE TABLE channel_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel channel_type NOT NULL,
  sender_id TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
