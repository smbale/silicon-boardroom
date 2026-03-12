# Silicon Boardroom - Supabase Setup & Verification

## ✅ Current Status

Your app is now running and connected to Supabase Cloud.

**Dev Server:** http://localhost:3000
**Status:** Running ✅

## Supabase Connection Details

**URL:** https://xjfoudlsfyrmgeyoevxy.supabase.co
**Anon Key:** sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA
**Environment:** `.env.local` configured ✅

## Required Database Tables

Your app needs these two tables in Supabase:

### 1. `agent_logs` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigserial | Primary key |
| `log_type` | text | Agent type or 'boardroom_verdict' |
| `content` | text | Message or JSON string |
| `created_at` | timestamp | Auto-generated timestamp |

**Sample Log Types:**
- `FINANCE AGENT`
- `CREATIVE DIRECTOR`
- `PROJECT MANAGER`
- `SYSTEM`
- `boardroom_verdict`

**Example Data:**
```sql
INSERT INTO agent_logs (log_type, content) VALUES
('FINANCE AGENT', 'Budget allocation approved for Q1'),
('CREATIVE DIRECTOR', 'New campaign concept ready for review'),
('PROJECT MANAGER', 'Milestone 3 completed on schedule');
```

### 2. `teams` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigserial | Primary key |
| `name` | text | Team name (e.g., 'Alpha') |
| `current_balance` | numeric | Treasury balance in USDC |

**Example Data:**
```sql
INSERT INTO teams (name, current_balance) VALUES
('Alpha', 10000.00);
```

## Setup Instructions

### Step 1: Access Supabase Console

1. Go to: https://app.supabase.com
2. Sign in with your account
3. Select project: `xjfoudlsfyrmgeyoevxy`

### Step 2: Create Tables

Go to **SQL Editor** and run:

```sql
-- Create agent_logs table
CREATE TABLE public.agent_logs (
  id BIGSERIAL PRIMARY KEY,
  log_type TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create teams table
CREATE TABLE public.teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  current_balance NUMERIC DEFAULT 0
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow anonymous reads)
CREATE POLICY "Enable read for all users" ON public.agent_logs
  FOR SELECT USING (true);

CREATE POLICY "Enable read for all users" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.agent_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.teams
  FOR UPDATE USING (true);
```

### Step 3: Enable Realtime

1. Go to **Tables** in Supabase console
2. Select `agent_logs` table
3. Click **"Realtime"** button (top right)
4. Enable for INSERT/UPDATE/DELETE events
5. Repeat for `teams` table

### Step 4: Insert Test Data

Go to **SQL Editor** and run:

```sql
-- Add Team Alpha
INSERT INTO teams (name, current_balance) VALUES ('Alpha', 10000.00);

-- Add sample logs
INSERT INTO agent_logs (log_type, content) VALUES
('SYSTEM', 'Boardroom session initialized'),
('FINANCE AGENT', 'Treasury balance: $10,000.00 USDC'),
('CREATIVE DIRECTOR', 'Q1 campaign strategy document prepared'),
('PROJECT MANAGER', 'Timeline for AI integration: 8 weeks'),
('FINANCE AGENT', 'Budget allocation: $3,000 for Q1 operations');
```

### Step 5: Verify Connection

1. **Open app:** http://localhost:3000
2. **Connect wallet** (upper right button)
3. **Check database status** (bottom left corner)
   - Should show "LIVE" with red pulse animation
4. **Terminal feed** should populate with logs
5. **Left panel** should show:
   - Market prices (FLR, XRP, BTC, ETH, SOM)
   - Team Alpha treasury balance
   - Your WFLR wallet balance

## Test Real-time Updates

### Via Supabase Console

1. Go to **SQL Editor**
2. Insert new log:
```sql
INSERT INTO agent_logs (log_type, content) VALUES
('FINANCE AGENT', 'New trade executed: +$500 profit');
```
3. Watch it appear in your app's terminal feed **instantly**

### Trigger Verdict (Overlay)

Insert a verdict log:
```sql
INSERT INTO agent_logs (log_type, content) VALUES
('boardroom_verdict', '{"monologue":"Your performance is unacceptable","fired_agent":"CREATIVE DIRECTOR","reason":"Failed to deliver on three consecutive proposals"}');
```

This will trigger the **Lord Silicon verdict overlay** in your app.

## API Endpoints Available

Since you're using PostgREST (via Supabase), these endpoints are available:

```bash
# Get all logs
curl https://xjfoudlsfyrmgeyoevxy.supabase.co/rest/v1/agent_logs \
  -H "apikey: sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA"

# Get team data
curl https://xjfoudlsfyrmgeyoevxy.supabase.co/rest/v1/teams \
  -H "apikey: sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA"

# Insert new log
curl -X POST https://xjfoudlsfyrmgeyoevxy.supabase.co/rest/v1/agent_logs \
  -H "apikey: sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA" \
  -H "Content-Type: application/json" \
  -d '{"log_type":"SYSTEM","content":"Test message"}'
```

## Troubleshooting

### "DB Status: ERROR"

**Check:**
1. Verify `.env.local` has correct Supabase credentials
2. Confirm tables exist in Supabase console
3. Open browser DevTools (F12) → Console tab
4. Look for error messages
5. Check network tab for failed API calls

**Fix:**
```bash
# Restart dev server
npm run dev
```

### No Logs Appearing

**Check:**
1. Is Real-time enabled on `agent_logs` table?
2. Does `agent_logs` table have data?
3. Check browser console for errors

**Fix:**
1. Enable Realtime on both tables (Supabase console)
2. Manually insert test data:
```sql
INSERT INTO agent_logs (log_type, content) VALUES 
('SYSTEM', 'Testing connection');
```

### Market Prices Show "---"

**Check:**
1. Connected to Flare network (chainId 14)?
2. Is your wallet connected?

**Fix:**
- Switch MetaMask to Flare network
- Click "Connect Wallet" button

### Wallet Balance Shows "Connect to Flare"

**Fix:**
1. Install MetaMask extension
2. Add Flare network to MetaMask:
   - Network Name: Flare
   - RPC URL: https://flare-api.flare.network/ext/C/rpc
   - Chain ID: 14
   - Currency: FLR
3. Connect wallet to app

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Check TypeScript
npx tsc --noEmit
```

## Next Steps

1. **Set up agent automation** to insert logs programmatically
2. **Add authentication** for user-specific dashboards
3. **Create leaderboard** from performance metrics
4. **Add notification system** for important events
5. **Deploy to production** (Vercel recommended for Next.js)

## Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Flare Network](https://flare.network)
- [Wagmi Docs](https://wagmi.sh)

## Support

If you encounter issues:

1. Check browser console (F12)
2. Review Supabase logs (Dashboard → Logs)
3. Verify table structure in Supabase SQL Editor
4. Test queries manually in Supabase console
