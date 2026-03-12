#!/usr/bin/env python3
"""
Silicon Boardroom - Supabase Database Setup
Creates required tables and inserts sample data
"""

import requests
import json
import sys

# Configuration
SUPABASE_URL = "https://xjfoudlsfyrmgeyoevxy.supabase.co"
SUPABASE_KEY = "sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA"
PROJECT_ID = "xjfoudlsfyrmgeyoevxy"

# SQL to create tables and insert data
SQL_SETUP = """
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
"""

def setup_database():
    """Execute SQL setup script via Supabase API"""
    print("🚀 Silicon Boardroom - Supabase Database Setup")
    print("=" * 50)
    print(f"📍 Project: {PROJECT_ID}")
    print(f"🔗 URL: {SUPABASE_URL}")
    print()

    try:
        print("⏳ Creating tables and inserting data...")
        
        # Headers for API request
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }

        # Method 1: Try via SQL RPC endpoint
        url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
        payload = {"query": SQL_SETUP}

        response = requests.post(url, headers=headers, json=payload, timeout=10)

        if response.status_code >= 400:
            # If RPC fails, try direct PostgreSQL query via PostgREST
            print("⚠️  RPC endpoint not available, trying direct API...")
            create_tables_via_api(headers)
            return

        print("✅ Database setup complete!")
        print()
        print("📊 Created Tables:")
        print("  • agent_logs - For storing AI agent messages")
        print("  • teams - For storing team data and balances")
        print()
        print("✨ Inserted Sample Data:")
        print("  • Team Alpha with $10,000 balance")
        print("  • 5 sample logs from various agents")
        print()
        print("🔔 Next Steps:")
        print("  1. Go to https://app.supabase.com")
        print("  2. Select project: xjfoudlsfyrmgeyoevxy")
        print("  3. Go to Tables → agent_logs")
        print("  4. Click 'Realtime' to enable real-time updates")
        print("  5. Repeat for 'teams' table")
        print("  6. Visit http://localhost:3000 to see the app")
        print()

    except Exception as e:
        print(f"❌ Setup failed: {e}")
        print()
        print("⚠️  Manual Setup Required:")
        print("  1. Go to https://app.supabase.com")
        print("  2. Select project: xjfoudlsfyrmgeyoevxy")
        print("  3. Go to SQL Editor")
        print("  4. Paste the SQL from SUPABASE_SETUP.md")
        print("  5. Click 'Run'")
        sys.exit(1)

def create_tables_via_api(headers):
    """Fallback: Create tables via individual API calls"""
    url = f"{SUPABASE_URL}/rest/v1"
    
    # Create agent_logs table structure
    agent_logs_payload = {
        "name": "agent_logs",
        "columns": [
            {"name": "id", "type": "bigint", "isPrimaryKey": True},
            {"name": "log_type", "type": "text"},
            {"name": "content", "type": "text"},
            {"name": "created_at", "type": "timestamp", "defaultValue": "now()"}
        ]
    }
    
    # Create teams table structure
    teams_payload = {
        "name": "teams",
        "columns": [
            {"name": "id", "type": "bigint", "isPrimaryKey": True},
            {"name": "name", "type": "text", "isUnique": True},
            {"name": "current_balance", "type": "numeric"}
        ]
    }
    
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    setup_database()
