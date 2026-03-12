# Silicon Boardroom - Google Cloud Run Deployment Checklist

## Pre-Deployment Checklist

### Prerequisites
- [ ] Google Cloud account created
- [ ] Billing enabled on Google Cloud
- [ ] gcloud CLI installed (`gcloud --version`)
- [ ] Docker Desktop installed (`docker --version`)
- [ ] Git installed and configured

### Project Setup
- [ ] Project files are in: `C:\Users\smbal\silicon-boardroom\`
- [ ] `.env.local` exists with Supabase credentials
- [ ] `.dockerignore` is configured
- [ ] `Dockerfile.cloudrun` exists
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] Database tables created in Supabase (agent_logs, teams)
- [ ] Realtime enabled on both tables

---

## Deployment Steps

### Step 1: Prepare Local Environment
- [ ] Run `npm install` (ensure all dependencies)
- [ ] Run `npm run build` locally (verify build succeeds)
- [ ] Test Docker image: `docker build -t test:latest -f Dockerfile.cloudrun .`
- [ ] Test Docker run: `docker run -p 3000:3000 test:latest`
- [ ] App loads at `http://localhost:3000` ✓

### Step 2: Google Cloud Setup
- [ ] Run `gcloud auth login`
- [ ] Create project: `gcloud projects create silicon-boardroom-project`
- [ ] Set project: `gcloud config set project silicon-boardroom-project`
- [ ] Set region: `gcloud config set run/region us-central1`
- [ ] Enable APIs:
  - [ ] Cloud Run
  - [ ] Cloud Build
  - [ ] Container Registry
  - [ ] Artifact Registry

### Step 3: Deploy Application
- [ ] **Option A:** Run deployment script
  - [ ] Windows: `.\deploy-cloudrun.ps1 silicon-boardroom-project silicon-boardroom us-central1`
  - [ ] Linux/Mac: `./deploy-cloudrun.sh silicon-boardroom-project silicon-boardroom us-central1`
- [ ] **Option B:** Manual deployment
  - [ ] Build Docker: `docker build -f Dockerfile.cloudrun -t gcr.io/silicon-boardroom-project/silicon-boardroom:latest .`
  - [ ] Push: `docker push gcr.io/silicon-boardroom-project/silicon-boardroom:latest`
  - [ ] Deploy: `gcloud run deploy silicon-boardroom --image=... --region us-central1 --allow-unauthenticated`

### Step 4: Verify Deployment
- [ ] Get service URL: `gcloud run services describe silicon-boardroom --region us-central1 --format='value(status.url)'`
- [ ] Copy URL
- [ ] Open in browser
- [ ] App loads successfully ✓
- [ ] Database status shows "LIVE" ✓
- [ ] Agent logs display ✓
- [ ] Market prices show ✓
- [ ] Team balance displays ✓

---

## Post-Deployment

### Immediate Actions
- [ ] Test all features in production app
- [ ] Connect wallet (if applicable)
- [ ] View logs: `gcloud run services logs read silicon-boardroom --region us-central1 --follow`
- [ ] Check for errors in Cloud Logging

### Optional: Custom Domain
- [ ] Purchase domain (if needed)
- [ ] Run: `gcloud run domain-mappings create --service=silicon-boardroom --domain=yourdomain.com --region=us-central1`
- [ ] Update DNS settings
- [ ] Verify domain resolution

### Optional: GitHub Auto-Deploy
- [ ] Push code to GitHub
- [ ] Connect repository: `gcloud builds connect --repo-name=silicon-boardroom --repo-owner=USERNAME`
- [ ] Create trigger: `gcloud builds triggers create github ...`
- [ ] Test auto-deploy by pushing code change

### Monitoring & Maintenance
- [ ] Set up Cloud Monitoring alerts
- [ ] Monitor daily logs for errors
- [ ] Track deployment costs
- [ ] Keep dependencies updated

---

## Deployment Configuration Verification

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set correctly
- [ ] `NODE_ENV=production` in Cloud Run

### Docker Configuration
- [ ] Base image: node:20-alpine ✓
- [ ] Non-root user (nextjs) ✓
- [ ] Port 3000 exposed ✓
- [ ] Standalone mode enabled ✓

### Next.js Configuration
- [ ] Build succeeds locally
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Image optimization working

---

## Troubleshooting Checklist

If something fails:

### Build Fails
- [ ] Check Docker installation
- [ ] Verify all files present
- [ ] Check disk space (>10GB free)
- [ ] Review build log output
- [ ] Try: `docker build --progress=plain ...`

### Deploy Fails
- [ ] Check gcloud authentication: `gcloud auth list`
- [ ] Verify project selected: `gcloud config list`
- [ ] Check quota limits
- [ ] Review Cloud Run logs
- [ ] Try manual deployment steps

### App Won't Load
- [ ] Check service is public: `--allow-unauthenticated`
- [ ] Verify Supabase credentials
- [ ] Check browser console (F12) for errors
- [ ] View Cloud Logging
- [ ] Test Supabase connection

### Performance Issues
- [ ] Increase memory: `--memory=1Gi`
- [ ] Increase CPU: `--cpu=2`
- [ ] Check Cold Starts with logging
- [ ] Optimize Docker image size
- [ ] Enable CDN caching if applicable

---

## Files Created for Deployment

| File | Status |
|------|--------|
| `Dockerfile.cloudrun` | ✅ Created |
| `.dockerignore` | ✅ Exists |
| `deploy-cloudrun.ps1` | ✅ Created |
| `deploy-cloudrun.sh` | ✅ Created |
| `cloudbuild.yaml` | ✅ Created |
| `DEPLOY_INDEX.md` | ✅ Created |
| `DEPLOY_QUICK.md` | ✅ Created |
| `CLOUD_RUN_DEPLOYMENT.md` | ✅ Created |

---

## Testing After Deployment

### Feature Testing
- [ ] Terminal feed displays logs
- [ ] Logs update in real-time
- [ ] Market prices display correctly
- [ ] Team balance shows correctly
- [ ] Wallet connection works
- [ ] WFLR balance displays
- [ ] All UI elements render

### Performance Testing
- [ ] Page loads in <3 seconds
- [ ] Real-time updates responsive
- [ ] No console errors
- [ ] Network requests successful
- [ ] Image optimization working

### Integration Testing
- [ ] Supabase connection working
- [ ] Database queries succeeding
- [ ] Real-time subscriptions active
- [ ] Wallet queries succeeding
- [ ] All external APIs responding

---

## Success Criteria

✅ **Deployment Successful When:**
- [ ] gcloud deploy command completes without errors
- [ ] Service URL provided
- [ ] App loads in browser
- [ ] All features working
- [ ] No critical errors in logs
- [ ] Response time < 2 seconds
- [ ] Real-time updates working
- [ ] Database connected

---

## Cost Tracking

### Estimate
- Deployment: Free (first time)
- Cloud Run: $15-30/month (typical usage)
- Storage: ~$0.02/month
- Build: Free (first 120 min/day)

### Monitor
```bash
# View billing information
gcloud billing accounts list

# Set budget alert
gcloud billing budgets create --billing-account=ACCOUNT_ID --display-name="Silicon Boardroom" --budget-amount=50
```

---

## Next Steps After Successful Deployment

1. **Share your deployment:**
   - Send URL to team/stakeholders
   - Document deployment process
   - Create internal documentation

2. **Improve deployment:**
   - Set up GitHub auto-deploy
   - Configure custom domain
   - Enable monitoring alerts

3. **Scale for production:**
   - Increase memory/CPU if needed
   - Set up database backups
   - Configure CDN caching
   - Add authentication layer

4. **Maintain deployment:**
   - Monitor logs daily
   - Keep dependencies updated
   - Regular security updates
   - Performance optimization

---

## Important Notes

⚠️ **Remember:**
- Keep `.env.local` with secrets secure (don't commit to git)
- Monitor costs regularly
- Update dependencies frequently
- Test before deploying
- Keep deployment scripts updated

---

## Help & Support

**Stuck?** Check these resources in order:
1. `DEPLOY_QUICK.md` — Quick fixes
2. `DEPLOY_INDEX.md` — Overview & troubleshooting
3. `CLOUD_RUN_DEPLOYMENT.md` — Detailed guide
4. [Google Cloud Run Docs](https://cloud.google.com/run/docs)

---

## Deployment Timeline

| Task | Time | Status |
|------|------|--------|
| Prerequisites | 15 min | ⏳ |
| Project setup | 5 min | ⏳ |
| Deploy script | 10-15 min | ⏳ |
| Verification | 5 min | ⏳ |
| **Total** | ~35-40 min | |

---

**Ready to deploy? Follow the steps above and your Silicon Boardroom will be live! 🚀**

Use this checklist to track progress and ensure nothing is missed.
