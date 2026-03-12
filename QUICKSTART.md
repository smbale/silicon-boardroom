# 🎯 Silicon Boardroom - Quick Start

## ✅ Current Status

| Component | Status |
|-----------|--------|
| **Dev Server** | ✅ Running on http://localhost:3000 |
| **Next.js** | ✅ Ready in 5.3s |
| **Supabase Client** | ✅ Configured |
| **Environment** | ✅ .env.local loaded |

## 🚀 What You Need to Do (5 Minutes)

### 1️⃣ Open Supabase Console
```
https://app.supabase.com
→ Select project: xjfoudlsfyrmgeyoevxy
→ Click "SQL Editor"
```

### 2️⃣ Create Tables (Copy & Paste)

Click "New Query" and paste:

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

-- Policies
CREATE POLICY "Enable read for all users" ON public.agent_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.agent_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON public.teams FOR UPDATE USING (true);

-- Sample Data
INSERT INTO teams (name, current_balance) VALUES ('Alpha', 10000.00) ON CONFLICT (name) DO NOTHING;
INSERT INTO agent_logs (log_type, content) VALUES
('SYSTEM', 'Boardroom session initialized'),
('FINANCE AGENT', 'Treasury balance: $10,000.00 USDC'),
('CREATIVE DIRECTOR', 'Q1 campaign strategy document prepared'),
('PROJECT MANAGER', 'Timeline for AI integration: 8 weeks'),
('FINANCE AGENT', 'Budget allocation: $3,000 for Q1 operations');
```

Click **"Run"** ✓

### 3️⃣ Enable Realtime

In Supabase console:
1. Click **"Tables"**
2. Click **"agent_logs"**
3. Click **"Realtime"** button (top right) → Turn ON ✓
4. Repeat for **"teams"** table ✓

### 4️⃣ View Your App

Open: **http://localhost:3000**

You should see:
- ✅ Database status: **LIVE** (red pulse)
- ✅ Terminal feed with logs
- ✅ Market prices (FLR, XRP, BTC, ETH, SOM)
- ✅ Team Alpha balance: **$10,000.00**

---

## 🧪 Test Real-time (Verify It Works)

1. In Supabase: **Tables** → **agent_logs** → **Insert Row**
2. Fill in:
   - `log_type`: `SYSTEM`
   - `content`: `Test message - real-time working!`
3. Click **Save**
4. Check your app → Message appears **instantly** ✅

---

## 📁 Files Created for Reference

- `MANUAL_SETUP.md` — Step-by-step setup guide
- `SUPABASE_SETUP.md` — Detailed setup & troubleshooting
- `SETUP_CHECKLIST.md` — Completion checklist
- `scripts/setup-supabase.py` — Python setup script (if needed)

---

## 🎮 Try These Actions

Once setup is complete:

### Insert a New Log
```sql
INSERT INTO agent_logs (log_type, content) VALUES
('SYSTEM', 'Performance metrics updated: +15% efficiency');
```
→ Watch it appear in app instantly

### Update Team Balance
```sql
UPDATE teams SET current_balance = 15000 WHERE name = 'Alpha';
```
→ Watch balance update in real-time

### Trigger Verdict (Overlay)
```sql
INSERT INTO agent_logs (log_type, content) VALUES
('boardroom_verdict', '{"monologue":"Your performance is unacceptable","fired_agent":"CREATIVE DIRECTOR","reason":"Failed to deliver on three consecutive proposals"}');
```
→ Red overlay appears with "Lord Silicon" verdict

---

## ⚡ Troubleshooting

| Problem | Solution |
|---------|----------|
| DB Status: ERROR | Check .env.local credentials, restart server |
| No logs appearing | Enable Realtime on agent_logs table |
| Prices show "---" | Connect wallet, switch to Flare network |
| App won't load | Check port 3000 available, restart npm run dev |

---

## 🎉 You're All Set!

Your Silicon Boardroom is ready to go. Once you complete the 3 setup steps above, everything will be live with real-time updates!

**Questions?** Check `MANUAL_SETUP.md` for detailed instructions.
