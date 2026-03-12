# Silicon Boardroom - Manual Supabase Setup Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Open Supabase Console

1. Go to: **https://app.supabase.com**
2. Sign in with your account
3. You should see project: **xjfoudlsfyrmgeyoevxy**
4. Click on it to open

### Step 2: Create Tables via SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"**
3. Copy and paste the SQL below:

```sql
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
('FINANCE AGENT', 'Budget allocation: $3,000 for Q1 operations');
```

4. Click the **"Run"** button (or press Ctrl+Enter)
5. Wait for success message: ✅ **"Success"**

### Step 3: Enable Realtime

1. In the left sidebar, click **"Tables"**
2. Click on **"agent_logs"** table
3. In the top right, find the **"Realtime"** button
4. Click it to enable (should turn blue)
5. Repeat for **"teams"** table

### Step 4: Verify Connection

1. Open your app: **http://localhost:3000**
2. You should see:
   - ✅ Database status shows **"LIVE"** (red pulse)
   - ✅ Terminal feed shows agent logs
   - ✅ Left panel shows market prices
   - ✅ Left panel shows "$10,000.00" Team Alpha balance

### Step 5: Test Real-time

1. Go back to Supabase console
2. Click **"Tables"** → **"agent_logs"**
3. Click **"Insert"** button
4. Add a new row:
   - `log_type`: `SYSTEM`
   - `content`: `Test message - real-time working!`
5. Click **"Save"**
6. Check your app - message should appear **instantly** in terminal feed

---

## 🔧 If You Encounter Issues

### Issue: "DB Status: ERROR"

**Check:**
1. Supabase credentials are correct in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xjfoudlsfyrmgeyoevxy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA
   ```

2. Tables exist - go to **Tables** in Supabase console
3. Browser console (F12) shows error messages

**Fix:**
```bash
# Restart dev server
npm run dev
```

### Issue: No Logs Appearing

**Check:**
1. Is Realtime enabled? (Tables → agent_logs → Realtime button should be blue)
2. Are there logs in database? (Tables → agent_logs → should show rows)

**Fix:**
1. Enable Realtime on both tables
2. Manually insert test log:
   ```sql
   INSERT INTO agent_logs (log_type, content) VALUES 
   ('SYSTEM', 'Manual test log');
   ```

### Issue: Market Prices Show "---"

**Cause:** Wallet not connected to Flare network

**Fix:**
1. Install MetaMask (if not already)
2. Add Flare network to MetaMask:
   - Network Name: `Flare`
   - RPC URL: `https://flare-api.flare.network/ext/C/rpc`
   - Chain ID: `14`
   - Currency Symbol: `FLR`
3. Click "Connect Wallet" button in app

### Issue: App Won't Load

**Check:**
1. Is dev server running? (Terminal should show "✓ Starting...")
2. Port 3000 available?
3. No TypeScript errors?

**Fix:**
```bash
# Stop server
# (Press Ctrl+C in terminal)

# Clear cache
rm -r .next

# Reinstall deps
npm install

# Restart
npm run dev
```

---

## 📊 Verify Table Structure

To check tables are correctly created, go to Supabase **SQL Editor** and run:

```sql
-- Check agent_logs table
SELECT * FROM agent_logs LIMIT 5;

-- Check teams table
SELECT * FROM teams;
```

You should see:
- agent_logs: 5 rows with log entries
- teams: 1 row with Team Alpha balance ($10,000)

---

## 🚀 Next Steps

Once everything is working:

1. **Automate log insertion** - Create a system to insert logs from your agents
2. **Add authentication** - Let users create accounts
3. **Create leaderboard** - Show performance metrics
4. **Deploy** - Push to production (Vercel)

---

## 📞 Support

**If still stuck:**

1. Check browser console (F12) for error messages
2. Check Supabase logs (Dashboard → Logs)
3. Verify tables in Supabase (SQL Editor)
4. Try re-running the SQL setup script
5. Check that Realtime is enabled on both tables

---

## ✅ Completion Checklist

- [ ] Supabase tables created
- [ ] Realtime enabled on both tables
- [ ] Sample data inserted
- [ ] App loads at http://localhost:3000
- [ ] Database status shows "LIVE"
- [ ] Terminal feed displays logs
- [ ] Market prices show values
- [ ] Team balance displays $10,000

Once all boxes are checked, your Silicon Boardroom is ready to use! 🎉
