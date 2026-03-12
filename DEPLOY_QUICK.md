# Silicon Boardroom - Quick Google Cloud Run Deployment

## ⚡ 10-Minute Deploy

### Prerequisites
- Google Cloud Account (with billing enabled)
- gcloud CLI installed
- Docker Desktop installed

### Option 1: Automated Deployment (Windows PowerShell)

```powershell
# Navigate to project
cd C:\Users\smbal\silicon-boardroom

# Run deployment script
.\deploy-cloudrun.ps1 silicon-boardroom-project silicon-boardroom us-central1
```

### Option 2: Automated Deployment (Linux/Mac Bash)

```bash
cd ~/silicon-boardroom
chmod +x deploy-cloudrun.sh
./deploy-cloudrun.sh silicon-boardroom-project silicon-boardroom us-central1
```

### Option 3: Manual Step-by-Step

#### Step 1: Authenticate
```bash
gcloud auth login
gcloud config set project silicon-boardroom-project
```

#### Step 2: Build and Push
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xjfoudlsfyrmgeyoevxy.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA \
  -t gcr.io/silicon-boardroom-project/silicon-boardroom:latest \
  -f Dockerfile.cloudrun .

gcloud auth configure-docker gcr.io
docker push gcr.io/silicon-boardroom-project/silicon-boardroom:latest
```

#### Step 3: Deploy
```bash
gcloud run deploy silicon-boardroom \
  --image=gcr.io/silicon-boardroom-project/silicon-boardroom:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=3600
```

---

## ✅ After Deployment

### Get your service URL
```bash
gcloud run services describe silicon-boardroom \
  --region us-central1 \
  --format='value(status.url)'
```

### View logs
```bash
gcloud run services logs read silicon-boardroom \
  --region us-central1 \
  --follow
```

### Update after code changes
```bash
# Push new code
git push origin main

# Cloud Build will auto-deploy (if CI/CD set up)
# Or manually redeploy:
gcloud run deploy silicon-boardroom \
  --image=gcr.io/silicon-boardroom-project/silicon-boardroom:latest \
  --region us-central1
```

---

## 🔗 Set Up Custom Domain (Optional)

```bash
# Map domain
gcloud run domain-mappings create \
  --service=silicon-boardroom \
  --domain=yourdomain.com \
  --region=us-central1

# Update DNS (CNAME): yourdomain.com → ghs.googleusercontent.com
```

---

## 🚀 Enable Auto-Deployment from GitHub

### Connect GitHub Repository
```bash
gcloud builds connect \
  --repo-name=silicon-boardroom \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --region=us-central1
```

### Create trigger for auto-deployment
```bash
gcloud builds triggers create github \
  --name=silicon-boardroom-auto-deploy \
  --repo-name=silicon-boardroom \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --region=us-central1
```

Now every push to `main` branch auto-deploys! ✅

---

## 💰 Cost Management

**Free tier includes:**
- 2M requests/month
- 360,000 GB-seconds/month
- Unlimited deployments

**Typical costs:**
- Development: ~$1-5/month
- Small production: ~$15-30/month
- High traffic: Pay only for what you use

**Monitor costs:**
```bash
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Silicon Boardroom Budget" \
  --budget-amount=50
```

---

## 🆘 Troubleshooting

### Build fails
```bash
# Check build logs
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)')

# Local test
docker build -t silicon-boardroom:latest -f Dockerfile.cloudrun .
```

### Deployment fails
- Check service quotas (Cloud Run)
- Verify environment variables
- Ensure memory/CPU sufficient

### App not accessible
- Check service is public: `--allow-unauthenticated`
- Verify Supabase credentials
- Check regional availability

---

## 📋 Files Created

| File | Purpose |
|------|---------|
| `Dockerfile.cloudrun` | Cloud Run optimized Dockerfile |
| `deploy-cloudrun.ps1` | Windows PowerShell deployment script |
| `deploy-cloudrun.sh` | Linux/Mac Bash deployment script |
| `cloudbuild.yaml` | CI/CD configuration for auto-deployment |
| `CLOUD_RUN_DEPLOYMENT.md` | Complete deployment guide |

---

## 🎯 Next Steps

1. ✅ Install gcloud CLI & Docker
2. ✅ Run deployment script
3. ✅ Visit deployed app
4. ✅ Set up custom domain (optional)
5. ✅ Enable CI/CD auto-deployment (optional)

---

## 📞 Support

- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

---

**Your app will be live in minutes! 🚀**
