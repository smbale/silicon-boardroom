#!/usr/bin/env powershell
# Silicon Boardroom - Google Cloud Run Deployment Script
# This script automates the entire deployment process

param(
    [string]$ProjectId = "silicon-boardroom-project",
    [string]$ServiceName = "silicon-boardroom",
    [string]$Region = "us-central1",
    [string]$ImageName = "silicon-boardroom"
)

# Configuration
$SupabaseUrl = "https://xjfoudlsfyrmgeyoevxy.supabase.co"
$SupabaseKey = "sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA"
$GcrHostname = "gcr.io"

Write-Host "🚀 Silicon Boardroom - Google Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "═" * 50

# Step 1: Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
$gcloud = gcloud --version 2>$null
if (-not $gcloud) {
    Write-Host "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}
Write-Host "✅ gcloud CLI found" -ForegroundColor Green

$docker = docker --version 2>$null
if (-not $docker) {
    Write-Host "❌ Docker not found. Please install Docker Desktop" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker found" -ForegroundColor Green

# Step 2: Authenticate with Google Cloud
Write-Host "`n🔐 Authenticating with Google Cloud..." -ForegroundColor Yellow
gcloud auth list
Write-Host "Ensure you're logged in. Press Enter to continue..."
Read-Host

# Step 3: Set project
Write-Host "`n📁 Setting Google Cloud project..." -ForegroundColor Yellow
gcloud config set project $ProjectId
gcloud config set run/region $Region
Write-Host "✅ Project set to: $ProjectId" -ForegroundColor Green
Write-Host "✅ Region set to: $Region" -ForegroundColor Green

# Step 4: Enable APIs
Write-Host "`n⚙️  Enabling Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com
gcloud services enable build.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
Write-Host "✅ APIs enabled" -ForegroundColor Green

# Step 5: Build Docker image
Write-Host "`n🐳 Building Docker image..." -ForegroundColor Yellow
docker build `
    --build-arg NEXT_PUBLIC_SUPABASE_URL=$SupabaseUrl `
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$SupabaseKey `
    -t "${ImageName}:latest" `
    -f Dockerfile.cloudrun .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image built: ${ImageName}:latest" -ForegroundColor Green

# Step 6: Test locally (optional)
Write-Host "`n🧪 Test locally? (Y/n)" -ForegroundColor Yellow
$testLocal = Read-Host
if ($testLocal -ne "n" -and $testLocal -ne "N") {
    Write-Host "Starting local test container on port 3000..." -ForegroundColor Cyan
    Write-Host "Visit: http://localhost:3000"
    Write-Host "Press Enter to continue with deployment..."
    docker run -p 3000:3000 "${ImageName}:latest"
}

# Step 7: Configure Docker authentication
Write-Host "`n🔐 Configuring Docker authentication..." -ForegroundColor Yellow
gcloud auth configure-docker $GcrHostname
Write-Host "✅ Docker authentication configured" -ForegroundColor Green

# Step 8: Tag and push image
Write-Host "`n📤 Pushing image to Google Container Registry..." -ForegroundColor Yellow
$imageUrl = "${GcrHostname}/${ProjectId}/${ImageName}:latest"

docker tag "${ImageName}:latest" $imageUrl
Write-Host "✅ Image tagged: $imageUrl" -ForegroundColor Green

docker push $imageUrl
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Image pushed to registry" -ForegroundColor Green

# Step 9: Deploy to Cloud Run
Write-Host "`n☁️  Deploying to Google Cloud Run..." -ForegroundColor Yellow
Write-Host "Service: $ServiceName" -ForegroundColor Cyan
Write-Host "Image: $imageUrl" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan

gcloud run deploy $ServiceName `
    --image=$imageUrl `
    --platform managed `
    --region=$Region `
    --allow-unauthenticated `
    --memory=512Mi `
    --cpu=1 `
    --timeout=3600 `
    --set-env-vars NODE_ENV=production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloud Run deployment failed" -ForegroundColor Red
    exit 1
}

# Step 10: Get service URL
Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
$serviceUrl = gcloud run services describe $ServiceName --region $Region --format='value(status.url)'
Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Cyan
Write-Host ""

# Step 11: Display next steps
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Visit your deployed app: $serviceUrl"
Write-Host "  2. View logs: gcloud run services logs read $ServiceName --region $Region --follow"
Write-Host "  3. Update service: gcloud run deploy $ServiceName --image=$imageUrl --region $Region"
Write-Host "  4. Add custom domain (optional): gcloud run domain-mappings create --service=$ServiceName --domain=yourdomain.com"
Write-Host ""
Write-Host "✨ Silicon Boardroom is now live!" -ForegroundColor Green
