# CI/CD Pipeline Documentation

This document provides comprehensive information about the Continuous Integration and Continuous Deployment (CI/CD) setup for the Tixe Freelancing Platform.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [GitHub Actions Workflows](#github-actions-workflows)
  - [Backend Deployment](#backend-deployment)
  - [Frontend Deployment](#frontend-deployment)
- [Setup Instructions](#setup-instructions)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Tixe Freelancing Platform uses GitHub Actions for automated CI/CD pipelines:

- **Frontend**: Built and deployed to AWS S3 + CloudFront
- **Backend**: Built as Docker image, pushed to AWS ECR, and deployed to AWS ECS Fargate

### Deployment Flow

```
Code Push → GitHub Actions → Build → Test → Deploy → Production
```

---

## Architecture

### Frontend Architecture
```
GitHub → Build React App → Upload to S3 → Invalidate CloudFront → Live on https://www.tixe.dev
```

### Backend Architecture
```
GitHub → Build Docker Image → Push to ECR → Update ECS Task → Deploy to Fargate → Live on https://api.tixe.dev
```

---

## Prerequisites

### AWS Resources Required

#### For Backend (ECS):
- ✅ ECR Repository: `freelancing-platform-backend`
- ✅ ECS Cluster: `freelancing-platform-cluster`
- ✅ ECS Service: `freelancing-backend-service`
- ✅ ECS Task Definition: `freelancing-backend-task`
- ✅ Application Load Balancer with api.tixe.dev pointing to it
- ✅ Target Group with health check configured
- ✅ Security Groups allowing inbound traffic on port 4000

#### For Frontend (S3):
- ✅ S3 Bucket: `tixe-frontend` (or your bucket name)
- ✅ CloudFront Distribution
- ✅ Route 53 records: www.tixe.dev and tixe.dev

### GitHub Secrets Required

Add these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### IAM Permissions Required

Create an IAM user with the following policies:

**For Backend Deployment:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListTasks"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

**For Frontend Deployment:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::tixe-frontend",
        "arn:aws:s3:::tixe-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## GitHub Actions Workflows

### Backend Deployment

**File**: `.github/workflows/deploy-backend.yml`

#### Trigger Conditions:
- Push to `main` or `feature/aws-deployment` branches
- Changes in `backend/**` directory
- Manual trigger via GitHub Actions UI

#### Workflow Steps:

1. **Checkout Code**: Fetches the latest code from repository
2. **Configure AWS Credentials**: Authenticates with AWS
3. **Login to ECR**: Authenticates Docker with Amazon ECR
4. **Build Docker Image**: Builds the backend container
5. **Tag Image**: Tags with commit SHA and 'latest'
6. **Push to ECR**: Uploads image to ECR repository
7. **Update Task Definition**: Updates ECS task with new image
8. **Deploy to ECS**: Deploys updated task to ECS service
9. **Wait for Stability**: Ensures service is running correctly

#### Environment Variables:
```yaml
AWS_REGION: us-east-1
ECR_REPOSITORY: freelancing-platform-backend
ECS_SERVICE: freelancing-backend-service
ECS_CLUSTER: freelancing-platform-cluster
ECS_TASK_DEFINITION: freelancing-backend-task
CONTAINER_NAME: freelancing-backend
```

#### Customization:
- Update the branch names if deploying from different branches
- Modify region if using a different AWS region
- Adjust resource names to match your AWS setup

---

### Frontend Deployment

**File**: `.github/workflows/deploy-frontend.yml`

#### Trigger Conditions:
- Push to `main` or `feature/aws-deployment` branches
- Changes in `frontend/**` directory
- Manual trigger via GitHub Actions UI

#### Workflow Steps:

1. **Checkout Code**: Fetches the latest code
2. **Setup Node.js**: Installs Node.js 18
3. **Install Dependencies**: Runs `npm ci`
4. **Build React App**: Creates production build with `REACT_APP_API_URL=https://api.tixe.dev`
5. **Configure AWS**: Authenticates with AWS
6. **Deploy to S3**: Syncs build files to S3 bucket
7. **Set Cache Headers**: Optimizes caching for static assets
8. **Invalidate CloudFront**: Clears CloudFront cache to serve new version

#### Environment Variables:
```yaml
AWS_REGION: us-east-1
S3_BUCKET: tixe-frontend
CLOUDFRONT_DISTRIBUTION_ID: E1234567890ABC  # ⚠️ REPLACE THIS
NODE_VERSION: '18'
REACT_APP_API_URL: https://api.tixe.dev
```

#### Important: Get CloudFront Distribution ID
```bash
aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'tixe.dev')]].Id" --output text
```

---

## Setup Instructions

### 1. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### 2. Update CloudFront Distribution ID

1. Find your CloudFront distribution ID:
   ```bash
   aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'tixe.dev')]].{ID:Id,Domain:Aliases.Items[0]}" --output table
   ```

2. Update `.github/workflows/deploy-frontend.yml`:
   ```yaml
   CLOUDFRONT_DISTRIBUTION_ID: E1234567890ABC  # Replace with actual ID
   ```

### 3. Verify AWS Resources

**For Backend:**
```bash
# Check ECR repository
aws ecr describe-repositories --repository-names freelancing-platform-backend

# Check ECS cluster
aws ecs describe-clusters --clusters freelancing-platform-cluster

# Check ECS service
aws ecs describe-services --cluster freelancing-platform-cluster --services freelancing-backend-service
```

**For Frontend:**
```bash
# Check S3 bucket
aws s3 ls s3://tixe-frontend

# Check CloudFront distribution
aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'tixe.dev')]]"
```

### 4. Update Workflow Settings (if needed)

If your AWS resources have different names:

1. Edit `.github/workflows/deploy-backend.yml`
2. Edit `.github/workflows/deploy-frontend.yml`
3. Update the `env` section with your resource names

### 5. Test the Workflows

#### Option 1: Push Code
```bash
# Make a small change
echo "# Test deployment" >> README.md
git add .
git commit -m "test: CI/CD pipeline"
git push origin feature/aws-deployment
```

#### Option 2: Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select workflow (Deploy Backend or Deploy Frontend)
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

---

## Deployment Process

### Automatic Deployment

When you push code to tracked branches:

```bash
git add .
git commit -m "feat: your feature description"
git push origin main  # or feature/aws-deployment
```

The workflow will:
1. ✅ Automatically trigger
2. ✅ Build your application
3. ✅ Deploy to AWS
4. ✅ Show status in GitHub Actions tab

### Manual Deployment

1. Go to GitHub repository
2. Click **Actions** tab
3. Select workflow to run
4. Click **Run workflow** button
5. Select branch
6. Click **Run workflow**

---

## Monitoring Deployments

### View Workflow Status

1. Go to **Actions** tab in GitHub repository
2. Click on the workflow run
3. View detailed logs for each step

### Check Backend Deployment

```bash
# View running tasks
aws ecs list-tasks --cluster freelancing-platform-cluster --service-name freelancing-backend-service

# Check service status
aws ecs describe-services --cluster freelancing-platform-cluster --services freelancing-backend-service

# View task logs (replace task-id)
aws logs tail /ecs/freelancing-backend --follow
```

### Check Frontend Deployment

```bash
# List S3 files
aws s3 ls s3://tixe-frontend --recursive | head -20

# Check CloudFront invalidation status
aws cloudfront list-invalidations --distribution-id YOUR_DISTRIBUTION_ID
```

### Verify Live Application

```bash
# Test backend
curl https://api.tixe.dev/health

# Test frontend
curl -I https://www.tixe.dev
```

---

## Troubleshooting

### Backend Issues

#### Error: "Repository does not exist"
```bash
# Create ECR repository
aws ecr create-repository --repository-name freelancing-platform-backend
```

#### Error: "Service does not exist"
- Check ECS service name in workflow file
- Verify service exists: `aws ecs describe-services --cluster freelancing-platform-cluster --services freelancing-backend-service`

#### Error: "Task failed to start"
```bash
# Check task definition
aws ecs describe-task-definition --task-definition freelancing-backend-task

# View stopped tasks
aws ecs list-tasks --cluster freelancing-platform-cluster --desired-status STOPPED
```

#### Container Health Check Failing
- Verify Target Group health check settings
- Check application logs: `aws logs tail /ecs/freelancing-backend --follow`
- Ensure environment variables are set in task definition

### Frontend Issues

#### Error: "Access Denied" to S3
- Verify IAM permissions
- Check S3 bucket policy
- Ensure bucket name is correct in workflow

#### CloudFront Not Updating
- Check invalidation status: `aws cloudfront list-invalidations --distribution-id YOUR_ID`
- Wait 5-10 minutes for invalidation to complete
- Try hard refresh in browser (Ctrl+Shift+R)

#### Build Failing
```bash
# Test build locally
cd frontend
npm ci
REACT_APP_API_URL=https://api.tixe.dev npm run build
```

### General Issues

#### GitHub Actions Permissions
- Verify AWS secrets are added correctly
- Check IAM user has required permissions
- Ensure secrets don't have trailing spaces

#### Workflow Not Triggering
- Check trigger paths match your changes
- Verify branch names in workflow file
- Check if workflow file has syntax errors

---

## Best Practices

### 1. Environment-Specific Configurations

Use different branches for different environments:
- `main` → Production
- `develop` → Staging
- `feature/*` → Development

### 2. Rollback Strategy

```bash
# List recent images
aws ecr describe-images --repository-name freelancing-platform-backend --query 'sort_by(imageDetails,& imagePushedAt)[-5:]'

# Update service to previous image
aws ecs update-service \
  --cluster freelancing-platform-cluster \
  --service freelancing-backend-service \
  --force-new-deployment \
  --task-definition freelancing-backend-task:PREVIOUS_REVISION
```

### 3. Cost Optimization

- Use ECR lifecycle policies to remove old images
- Set proper cache headers for S3/CloudFront
- Monitor CloudFront invalidation costs (first 1000/month free)

### 4. Security

- ✅ Never commit `.env` files
- ✅ Use GitHub secrets for sensitive data
- ✅ Rotate AWS credentials regularly
- ✅ Use least-privilege IAM policies
- ✅ Enable MFA on AWS account

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

---

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions tab
2. Review AWS CloudWatch logs
3. Verify AWS resource configurations
4. Check this documentation's troubleshooting section

---

**Last Updated**: February 4, 2026  
**Version**: 1.0.0
