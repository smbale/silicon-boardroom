# Silicon Boardroom - Google Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI (gcloud)** installed
3. **Docker** installed locally
4. **Git** repository (GitHub, GitLab, or Bitbucket)

### Install Google Cloud CLI

**Windows:**
```powershell
# Download from:
https://cloud.google.com/sdk/docs/install-sdk

# Or via Chocolatey:
choco install google-cloud-sdk
```

**Verify installation:**
```bash
gcloud --version
```

---

## Step 1: Set Up Google Cloud Project

### Create a new project
```bash
# Create project (replace PROJECT_NAME with your choice)
gcloud projects create silicon-boardroom-project --name="Silicon Boardroom"

# Set as active project
gcloud config set project silicon-boardroom-project

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable build.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Authenticate with Google Cloud
```bash
# Login to Google Cloud
gcloud auth login

# Set default region (use a region close to your users)
gcloud config set run/region us-central1
```

---

## Step 2: Prepare Your Application

### Update next.config.ts

Your config is already good! But ensure:
```typescript
output: 'standalone' // ✅ Already set
```

### Create .dockerignore

```dockerfile
.git
.gitignore
node_modules
npm-debug.log
.next/cache
.env
.env.local
.env.*.local
```

### Verify .env.local exists

Your environment variables must be set:
```
NEXT_PUBLIC_SUPABASE_URL=https://xjfoudlsfyrmgeyoevxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA
```

---

## Step 3: Build and Test Locally

### Build Docker image
```bash
cd C:\Users\smbal\silicon-boardroom

# Build with environment variables
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xjfoudlsfyrmgeyoevxy.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA \
  -t silicon-boardroom:latest .
```

### Test locally
```bash
# Run container
docker run -p 3000:3000 silicon-boardroom:latest

# Visit: http://localhost:3000
```

---

## Step 4: Push to Container Registry

### Configure Docker authentication
```bash
# Configure Docker to use gcloud for authentication
gcloud auth configure-docker gcr.io
```

### Tag and push image
```bash
# Set variables
$PROJECT_ID = "silicon-boardroom-project"
$IMAGE_NAME = "silicon-boardroom"
$IMAGE_TAG = "latest"
$GCR_HOSTNAME = "gcr.io"

# Tag image
docker tag silicon-boardroom:latest `
  $GCR_HOSTNAME/$PROJECT_ID/$IMAGE_NAME:$IMAGE_TAG

# Push to Google Container Registry
docker push $GCR_HOSTNAME/$PROJECT_ID/$IMAGE_NAME:$IMAGE_TAG

# Verify push
gcloud container images list
```

---

## Step 5: Deploy to Cloud Run

### Deploy from Container Registry
```bash
$PROJECT_ID = "silicon-boardroom-project"
$SERVICE_NAME = "silicon-boardroom"
$IMAGE_URL = "gcr.io/$PROJECT_ID/silicon-boardroom:latest"
$REGION = "us-central1"

gcloud run deploy $SERVICE_NAME `
  --image=$IMAGE_URL `
  --platform managed `
  --region=$REGION `
  --allow-unauthenticated `
  --memory=512Mi `
  --cpu=1 `
  --timeout=3600 `
  --set-env-vars=NODE_ENV=production
```

### After deployment
```
Service URL: https://silicon-boardroom-XXXXX.run.app
```

---

## Step 6: Configure Environment Variables

### Set sensitive variables in Cloud Run
```bash
gcloud run services update silicon-boardroom `
  --region us-central1 `
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=https://xjfoudlsfyrmgeyoevxy.supabase.co
```

Or via Cloud Console:
1. Go to Cloud Run services
2. Click your service
3. Click "Edit & Deploy New Revision"
4. Add environment variables
5. Deploy

---

## Step 7: Set Up CI/CD (Recommended)

### Create cloudbuild.yaml

```yaml
steps:
  # Step 1: Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg=NEXT_PUBLIC_SUPABASE_URL=https://xjfoudlsfyrmgeyoevxy.supabase.co'
      - '--build-arg=NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA'
      - '-t=gcr.io/$PROJECT_ID/silicon-boardroom:$SHORT_SHA'
      - '-t=gcr.io/$PROJECT_ID/silicon-boardroom:latest'
      - '.'

  # Step 2: Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/silicon-boardroom:$SHORT_SHA'

  # Step 3: Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=.
      - '--image=gcr.io/$PROJECT_ID/silicon-boardroom:$SHORT_SHA'
      - '--location=us-central1'
      - '--output=/workspace/output'

images:
  - 'gcr.io/$PROJECT_ID/silicon-boardroom:$SHORT_SHA'
  - 'gcr.io/$PROJECT_ID/silicon-boardroom:latest'

timeout: '1800s'
```

### Enable Cloud Build
```bash
# Connect GitHub repo
gcloud builds connect --repo-name=silicon-boardroom --repo-owner=YOUR_GITHUB_USERNAME

# Trigger auto-deployment on push
gcloud builds triggers create github \
  --repo-name=silicon-boardroom \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

---

## Step 8: Monitor Deployment

### View logs
```bash
# View Cloud Run logs
gcloud run services describe silicon-boardroom --region us-central1

# Stream logs
gcloud run services logs read silicon-boardroom --region us-central1 --limit 50 --follow
```

### Check service health
```bash
# Test the deployed app
$SERVICE_URL = gcloud run services describe silicon-boardroom `
  --region us-central1 --format='value(status.url)'

curl $SERVICE_URL
```

---

## Step 9: Custom Domain (Optional)

### Map custom domain
```bash
gcloud run domain-mappings create \
  --service=silicon-boardroom \
  --domain=yourdomain.com \
  --region=us-central1
```

### Update DNS records
Point your domain's DNS to Cloud Run:
- Type: CNAME
- Name: yourdomain.com
- Value: ghs.googleusercontent.com

---

## Troubleshooting

### Build fails
```bash
# Check build logs
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)')

# Rebuild with verbose output
docker build --progress=plain -t silicon-boardroom:latest .
```

### Deployment fails
- Check Docker image size (must be < 2GB)
- Verify environment variables are set
- Check memory/CPU limits

### Service unreachable
- Check service is public (--allow-unauthenticated)
- Verify CORS settings for Supabase
- Check firewall rules

---

## Cost Estimation

**Cloud Run pricing (us-central1):**
- 2M requests/month free
- $0.40 per 1M requests
- $0.00001667 per vCPU-second
- $0.00000417 per GB-second

**Typical usage:**
- ~100 requests/day → ~$0.01/month
- 24/7 running with 512Mi RAM → ~$15/month

---

## Next Steps

1. ✅ Install gcloud CLI
2. ✅ Create Google Cloud project
3. ✅ Build Docker image locally
4. ✅ Push to Container Registry
5. ✅ Deploy to Cloud Run
6. ✅ Set up CI/CD for auto-deployment
7. ✅ Monitor logs
8. ✅ Configure custom domain

---

## Quick Command Reference

```bash
# Create project
gcloud projects create silicon-boardroom-project

# Enable APIs
gcloud services enable run.googleapis.com build.googleapis.com

# Build locally
docker build -t silicon-boardroom:latest .

# Push to registry
docker push gcr.io/silicon-boardroom-project/silicon-boardroom:latest

# Deploy
gcloud run deploy silicon-boardroom \
  --image=gcr.io/silicon-boardroom-project/silicon-boardroom:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# View service
gcloud run services describe silicon-boardroom --region us-central1

# Stream logs
gcloud run services logs read silicon-boardroom --region us-central1 --follow
```

---

## Resources

- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
