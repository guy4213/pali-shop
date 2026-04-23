-- Migration 006: Support tickets table for customer-support chatbot
-- ============================================================
-- CONTEXT:
--   Adds the support_tickets table which stores escalated customer
--   support interactions originating from the AI chat widget.
--   Includes indexes, CHECK constraints, a consistency constraint
--   (handled fields must be set together), and RLS policies
--   matching the gift_claims pattern from 001_initial_schema.sql.
-- ============================================================


-- ============================================================
-- 1. SUPPORT TICKETS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_name    TEXT        NOT NULL CHECK (char_length(buyer_name) BETWEEN 2 AND 100),
  buyer_phone   TEXT        NOT NULL CHECK (char_length(buyer_phone) BETWEEN 7 AND 20),
  buyer_email   TEXT,
  issue_summary TEXT        NOT NULL CHECK (char_length(issue_summary) BETWEEN 5 AND 500),
  chat_history  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  status        TEXT        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'handled')),
  handled_by    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  handled_at    TIMESTAMPTZ,
  CONSTRAINT support_tickets_handled_consistency
    CHECK (
      (status = 'open'    AND handled_at IS NULL    AND handled_by IS NULL)
      OR
      (status = 'handled' AND handled_at IS NOT NULL)
    )
);


-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created
  ON support_tickets(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_phone
  ON support_tickets(buyer_phone);


-- ============================================================
-- 3. ROW LEVEL SECURITY
--    Pattern matches gift_claims from 001_initial_schema.sql:
--    public insert allowed, admin has full access.
-- ============================================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Public (including unauthenticated chat users) can create tickets
DO $$ BEGIN
  CREATE POLICY "support_tickets_public_insert" ON support_tickets
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin has full access (read, update, delete) to all tickets
DO $$ BEGIN
  CREATE POLICY "support_tickets_admin_all" ON support_tickets
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
