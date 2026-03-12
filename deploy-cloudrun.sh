#!/bin/bash
# Silicon Boardroom - Google Cloud Run Deployment Script (Bash)
# This script automates the entire deployment process

set -e

# Configuration
PROJECT_ID="${1:-silicon-boardroom-project}"
SERVICE_NAME="${2:-silicon-boardroom}"
REGION="${3:-us-central1}"
IMAGE_NAME="silicon-boardroom"
SUPABASE_URL="https://xjfoudlsfyrmgeyoevxy.supabase.co"
SUPABASE_KEY="sb_publishable_13dWjhR4ZgO-q97R_FrIAw_NVV-ZHzA"
GCR_HOSTNAME="gcr.io"

echo "🚀 Silicon Boardroom - Google Cloud Run Deployment"
echo "=================================================="

# Step 1: Check prerequisites
echo ""
echo "📋 Checking prerequisites..."
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
echo "✅ gcloud CLI found"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi
echo "✅ Docker found"

# Step 2: Set project
echo ""
echo "📁 Setting Google Cloud project..."
gcloud config set project "$PROJECT_ID"
gcloud config set run/region "$REGION"
echo "✅ Project: $PROJECT_ID"
echo "✅ Region: $REGION"

# Step 3: Enable APIs
echo ""
echo "⚙️  Enabling Google Cloud APIs..."
gcloud services enable run.googleapis.com
gcloud services enable build.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
echo "✅ APIs enabled"

# Step 4: Build Docker image
echo ""
echo "🐳 Building Docker image..."
docker build \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_KEY" \
    -t "${IMAGE_NAME}:latest" \
    -f Dockerfile.cloudrun .
echo "✅ Docker image built"

# Step 5: Configure Docker authentication
echo ""
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker "$GCR_HOSTNAME"
echo "✅ Docker authentication configured"

# Step 6: Tag and push image
echo ""
echo "📤 Pushing image to Google Container Registry..."
IMAGE_URL="${GCR_HOSTNAME}/${PROJECT_ID}/${IMAGE_NAME}:latest"
docker tag "${IMAGE_NAME}:latest" "$IMAGE_URL"
echo "✅ Image tagged"

docker push "$IMAGE_URL"
echo "✅ Image pushed"

# Step 7: Deploy to Cloud Run
echo ""
echo "☁️  Deploying to Google Cloud Run..."
echo "Service: $SERVICE_NAME"
echo "Image: $IMAGE_URL"
echo "Region: $REGION"

gcloud run deploy "$SERVICE_NAME" \
    --image="$IMAGE_URL" \
    --platform managed \
    --region="$REGION" \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --timeout=3600 \
    --set-env-vars NODE_ENV=production

# Step 8: Get service URL
echo ""
echo "✅ Deployment successful!"
echo ""
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')
echo "🌐 Service URL: $SERVICE_URL"
echo ""

# Step 9: Display next steps
echo "📋 Next Steps:"
echo "  1. Visit your app: $SERVICE_URL"
echo "  2. View logs: gcloud run services logs read $SERVICE_NAME --region $REGION --follow"
echo "  3. Update: gcloud run deploy $SERVICE_NAME --image=$IMAGE_URL --region $REGION"
echo "  4. Custom domain: gcloud run domain-mappings create --service=$SERVICE_NAME --domain=yourdomain.com"
echo ""
echo "✨ Silicon Boardroom is live!"
