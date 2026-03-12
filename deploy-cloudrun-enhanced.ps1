#!/usr/bin/env powershell
# Silicon Boardroom - Google Cloud Run Deployment Script
# Windows PowerShell - One-Click Deployment

param(
    [string]$ProjectId = "silicon-boardroom-project",
    [string]$ServiceName = "silicon-boardroom",
    [string]$Region = "us-central1",
    [string]$ImageName = "silicon-boardroom",
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$SupabaseUrl = "https://xjfoudlsfyrmgeyoevxy.supabase.co"
$SupabaseKey = "sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA"
$GcrHostname = "gcr.io"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Silicon Boardroom - Google Cloud Run Deploy" -ForegroundColor Cyan
Write-Host "  One-Click Deployment" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$gcloudFound = $false
$dockerFound = $false

try {
    $gcloudVersion = gcloud --version 2>$null | Select-Object -First 1
    if ($gcloudVersion) {
        Write-Host "[OK] gcloud CLI: $gcloudVersion" -ForegroundColor Green
        $gcloudFound = $true
    }
} catch {}

if (-not $gcloudFound) {
    Write-Host "[ERROR] gcloud CLI not found!" -ForegroundColor Red
    Write-Host "Download: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "[OK] Docker: $dockerVersion" -ForegroundColor Green
        $dockerFound = $true
    }
} catch {}

if (-not $dockerFound) {
    Write-Host "[ERROR] Docker not found!" -ForegroundColor Red
    Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Step 2: Verify gcloud authentication
Write-Host ""
Write-Host "Step 2: Verifying Google Cloud authentication..." -ForegroundColor Yellow
Write-Host ""

try {
    $currentAccount = gcloud config get-value account 2>$null
    if ($currentAccount) {
        Write-Host "[OK] Authenticated as: $currentAccount" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Not authenticated. Running: gcloud auth login" -ForegroundColor Yellow
        gcloud auth login
    }
} catch {
    Write-Host "[ERROR] Authentication check failed" -ForegroundColor Red
    exit 1
}

# Step 3: Configure Google Cloud project
Write-Host ""
Write-Host "Step 3: Configuring Google Cloud project..." -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Setting project: $ProjectId" -ForegroundColor Cyan
    gcloud config set project $ProjectId 2>$null
    Write-Host "[OK] Project configured" -ForegroundColor Green

    Write-Host "Setting region: $Region" -ForegroundColor Cyan
    gcloud config set run/region $Region 2>$null
    Write-Host "[OK] Region configured" -ForegroundColor Green

    Write-Host "Enabling required APIs..." -ForegroundColor Cyan
    gcloud services enable run.googleapis.com 2>$null
    gcloud services enable build.googleapis.com 2>$null
    gcloud services enable container.googleapis.com 2>$null
    gcloud services enable artifactregistry.googleapis.com 2>$null
    Write-Host "[OK] APIs enabled" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Project configuration failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Build Docker image
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Step 4: Building Docker image..." -ForegroundColor Yellow
    Write-Host ""

    $projectPath = Get-Location
    Write-Host "Project path: $projectPath" -ForegroundColor Cyan

    try {
        Write-Host "Building: ${ImageName}:latest" -ForegroundColor Cyan
        docker build `
            --build-arg NEXT_PUBLIC_SUPABASE_URL=$SupabaseUrl `
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$SupabaseKey `
            -t "${ImageName}:latest" `
            -f Dockerfile.cloudrun .

        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed with exit code $LASTEXITCODE"
        }
        Write-Host "[OK] Docker image built successfully" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Docker build failed: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "Step 4: Skipping Docker build (using cache)" -ForegroundColor Yellow
}

# Step 5: Configure Docker authentication
Write-Host ""
Write-Host "Step 5: Configuring Docker authentication..." -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Configuring Docker for: $GcrHostname" -ForegroundColor Cyan
    gcloud auth configure-docker $GcrHostname 2>$null
    Write-Host "[OK] Docker authentication configured" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker authentication failed: $_" -ForegroundColor Red
    exit 1
}

# Step 6: Tag and push image
Write-Host ""
Write-Host "Step 6: Pushing image to Google Container Registry..." -ForegroundColor Yellow
Write-Host ""

$imageUrl = "${GcrHostname}/${ProjectId}/${ImageName}:latest"
Write-Host "Target: $imageUrl" -ForegroundColor Cyan

try {
    Write-Host "Tagging image..." -ForegroundColor Cyan
    docker tag "${ImageName}:latest" $imageUrl
    Write-Host "[OK] Image tagged" -ForegroundColor Green

    Write-Host "Pushing to registry (this may take 1-2 minutes)..." -ForegroundColor Cyan
    docker push $imageUrl

    if ($LASTEXITCODE -ne 0) {
        throw "Docker push failed with exit code $LASTEXITCODE"
    }
    Write-Host "[OK] Image pushed successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker push failed: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Deploy to Cloud Run
Write-Host ""
Write-Host "Step 7: Deploying to Google Cloud Run..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Service: $ServiceName" -ForegroundColor Cyan
Write-Host "Image: $imageUrl" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host ""
Write-Host "(This may take 2-3 minutes...)" -ForegroundColor Yellow
Write-Host ""

try {
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
        throw "Cloud Run deployment failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "[ERROR] Cloud Run deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Step 8: Get service URL
Write-Host ""
Write-Host "Step 8: Retrieving service URL..." -ForegroundColor Yellow
Write-Host ""

try {
    $serviceUrl = gcloud run services describe $ServiceName `
        --region $Region `
        --format='value(status.url)' 2>$null

    if ($serviceUrl) {
        Write-Host "[OK] Service URL: $serviceUrl" -ForegroundColor Green
    } else {
        throw "Could not retrieve service URL"
    }
} catch {
    Write-Host "[WARNING] Could not retrieve service URL automatically" -ForegroundColor Yellow
    Write-Host "Run this command manually:" -ForegroundColor Cyan
    Write-Host "gcloud run services describe $ServiceName --region $Region --format='value(status.url)'" -ForegroundColor Yellow
    exit 1
}

# Step 9: Display success message
Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Your Silicon Boardroom is LIVE!" -ForegroundColor Green
Write-Host ""
Write-Host "Service URL:" -ForegroundColor Cyan
Write-Host "  $serviceUrl" -ForegroundColor Green
Write-Host ""

Write-Host "What's Next:" -ForegroundColor Cyan
Write-Host "  1. Visit your app: $serviceUrl" -ForegroundColor White
Write-Host "  2. Share the URL with your team" -ForegroundColor White
Write-Host "  3. Monitor logs (see commands below)" -ForegroundColor White
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  View logs:" -ForegroundColor White
Write-Host "    gcloud run services logs read $ServiceName --region $Region --follow" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Service details:" -ForegroundColor White
Write-Host "    gcloud run services describe $ServiceName --region $Region" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Update (redeploy after code changes):" -ForegroundColor White
Write-Host "    gcloud run deploy $ServiceName --image=$imageUrl --region $Region" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Delete service (if needed):" -ForegroundColor White
Write-Host "    gcloud run services delete $ServiceName --region $Region" -ForegroundColor Yellow
Write-Host ""

Write-Host "Optional: Set up custom domain:" -ForegroundColor Cyan
Write-Host "  gcloud run domain-mappings create --service=$ServiceName --domain=yourdomain.com --region=$Region" -ForegroundColor Yellow
Write-Host ""

Write-Host "Silicon Boardroom is now production-ready!" -ForegroundColor Green
Write-Host ""

# Save URL to file for reference
$urlFile = "DEPLOYMENT_URL.txt"
Set-Content -Path $urlFile -Value "Service URL: $serviceUrl"
Add-Content -Path $urlFile -Value "Deployed: $(Get-Date)"
Add-Content -Path $urlFile -Value "Service: $ServiceName"
Add-Content -Path $urlFile -Value "Region: $Region"

Write-Host "URL saved to: $urlFile" -ForegroundColor Green
Write-Host ""
