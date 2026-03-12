# Silicon Boardroom - Quick Checklist

## Development Server
- [x] Next.js dev server running on http://localhost:3000
- [ ] App loads without errors (check browser console)
- [ ] Supabase client initializes (check Network tab in DevTools)

## Supabase Setup
- [ ] Logged into Supabase console
- [ ] Project selected: `xjfoudlsfyrmgeyoevxy`
- [ ] Created `agent_logs` table
- [ ] Created `teams` table
- [ ] Enabled Realtime on both tables

## Database Tables
- [ ] `agent_logs` table has columns: id, log_type, content, created_at
- [ ] `teams` table has columns: id, name, current_balance
- [ ] RLS policies created for read/write access
- [ ] Sample data inserted into both tables

## App Verification
- [ ] Visit http://localhost:3000
- [ ] Page loads and renders without errors
- [ ] Database status shows "LIVE" (red pulse)
- [ ] Terminal feed displays agent logs
- [ ] Left panel shows market prices
- [ ] Left panel shows Team Alpha balance

## Wallet Connection (Optional)
- [ ] MetaMask installed
- [ ] Flare network added to MetaMask
- [ ] Connected wallet to app
- [ ] WFLR balance displays correctly

## Real-time Testing
- [ ] Insert new log in Supabase console
- [ ] Watch it appear in app's terminal feed instantly
- [ ] Update team balance in Supabase
- [ ] Watch balance update in app instantly

## Next Steps
- [ ] Set up automation to insert logs programmatically
- [ ] Create API endpoint for external systems
- [ ] Deploy to production (Vercel)
- [ ] Configure CI/CD pipeline

---

## Need Help?

1. **Check logs:**
   ```bash
   # Browser console (F12)
   # Check for errors or warnings
   
   # Terminal (where npm run dev runs)
   # Check for build errors
   ```

2. **Test Supabase connection:**
   - Go to Supabase console
   - SQL Editor
   - Run: `SELECT * FROM agent_logs;`
   - Should return recent logs

3. **Verify Real-time:**
   - Insert a test log in SQL Editor
   - Watch app for instant update
   - If no update, disable/re-enable Realtime on table

4. **Reset Everything:**
   ```bash
   # Stop dev server
   npm run dev  # (press Ctrl+C)
   
   # Clear Next.js cache
   rm -r .next
   
   # Reinstall dependencies
   npm install
   
   # Restart dev server
   npm run dev
   ```

**Questions?** Check SUPABASE_SETUP.md for detailed instructions.
