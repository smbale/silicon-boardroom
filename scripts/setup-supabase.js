#!/usr/bin/env node

/**
 * Silicon Boardroom - Supabase Database Setup Script
 * This script creates the required tables and inserts sample data
 */

const https = require('https');

// Configuration
const SUPABASE_URL = 'https://xjfoudlsfyrmgeyoevxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA';

// SQL commands to create tables
const SQL_SETUP = `
-- Create agent_logs table
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id BIGSERIAL PRIMARY KEY,
  log_type TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  current_balance NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read for all users" ON public.agent_logs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.agent_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.teams
  FOR UPDATE USING (true);

-- Insert sample data
INSERT INTO teams (name, current_balance) VALUES ('Alpha', 10000.00)
  ON CONFLICT (name) DO NOTHING;

INSERT INTO agent_logs (log_type, content) VALUES
('SYSTEM', 'Boardroom session initialized'),
('FINANCE AGENT', 'Treasury balance: $10,000.00 USDC'),
('CREATIVE DIRECTOR', 'Q1 campaign strategy document prepared'),
('PROJECT MANAGER', 'Timeline for AI integration: 8 weeks'),
('SYSTEM', 'All agents connected and ready');
`;

/**
 * Execute SQL via Supabase SQL Editor API
 */
function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    
    const data = JSON.stringify({
      query: sql
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            success: true,
            status: res.statusCode,
            data: responseData
          });
        } else {
          reject({
            success: false,
            status: res.statusCode,
            message: responseData
          });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('🚀 Silicon Boardroom - Supabase Database Setup');
  console.log('━'.repeat(50));
  console.log(`📍 Project: xjfoudlsfyrmgeyoevxy`);
  console.log(`🔗 URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    console.log('⏳ Creating tables and inserting data...');
    
    const result = await executeSql(SQL_SETUP);
    
    console.log('✅ Database setup complete!');
    console.log('');
    console.log('📊 Created Tables:');
    console.log('  • agent_logs - For storing AI agent messages');
    console.log('  • teams - For storing team data and balances');
    console.log('');
    console.log('✨ Inserted Sample Data:');
    console.log('  • Team Alpha with $10,000 balance');
    console.log('  • 5 sample logs from various agents');
    console.log('');
    console.log('🔔 Next Steps:');
    console.log('  1. Go to https://app.supabase.com');
    console.log('  2. Select project: xjfoudlsfyrmgeyoevxy');
    console.log('  3. Go to Tables → agent_logs');
    console.log('  4. Click "Realtime" to enable real-time updates');
    console.log('  5. Repeat for "teams" table');
    console.log('  6. Visit http://localhost:3000 to see the app');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:');
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
