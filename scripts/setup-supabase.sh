#!/bin/bash
# Silicon Boardroom - Supabase Database Setup
# This script creates required tables and inserts sample data

# Configuration
SUPABASE_URL="https://xjfoudlsfyrmgeyoevxy.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA"
PROJECT_ID="xjfoudlsfyrmgeyoevxy"

echo "🚀 Silicon Boardroom - Supabase Database Setup"
echo "=================================================="
echo "📍 Project: $PROJECT_ID"
echo "🔗 URL: $SUPABASE_URL"
echo ""

# SQL to create tables
read -r -d '' SQL_SETUP << 'EOF' || true
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id BIGSERIAL PRIMARY KEY,
  log_type TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  current_balance NUMERIC DEFAULT 0
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for all users" ON public.agent_logs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.agent_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.teams
  FOR UPDATE USING (true);

INSERT INTO teams (name, current_balance) VALUES ('Alpha', 10000.00)
  ON CONFLICT (name) DO NOTHING;

INSERT INTO agent_logs (log_type, content) VALUES
('SYSTEM', 'Boardroom session initialized'),
('FINANCE AGENT', 'Treasury balance: $10,000.00 USDC'),
('CREATIVE DIRECTOR', 'Q1 campaign strategy document prepared'),
('PROJECT MANAGER', 'Timeline for AI integration: 8 weeks'),
('SYSTEM', 'All agents connected and ready');
EOF

echo "⏳ Setting up database tables..."

# Execute via cURL
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(echo "$SQL_SETUP" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')\"}")

if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ Setup failed: $RESPONSE"
  exit 1
else
  echo "✅ Database setup complete!"
fi

echo ""
echo "📊 Created Tables:"
echo "  • agent_logs - For storing AI agent messages"
echo "  • teams - For storing team data and balances"
echo ""
echo "✨ Inserted Sample Data:"
echo "  • Team Alpha with \$10,000 balance"
echo "  • 5 sample logs from various agents"
echo ""
echo "🔔 Next Steps:"
echo "  1. Go to https://app.supabase.com"
echo "  2. Select project: $PROJECT_ID"
echo "  3. Go to Tables → agent_logs"
echo "  4. Click 'Realtime' to enable real-time updates"
echo "  5. Repeat for 'teams' table"
echo "  6. Visit http://localhost:3000 to see the app"
echo ""
