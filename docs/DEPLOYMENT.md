# Deployment Guide - Student Hub (Leavs)

> **Complete guide to deploying and managing the application**  
> Last updated: February 18, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Deployment Environments](#deployment-environments)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Local Development](#local-development)
5. [Sandbox Deployment](#sandbox-deployment)
6. [Production Deployment](#production-deployment)
7. [Environment Variables](#environment-variables)
8. [Build Process](#build-process)
9. [Rollback Procedures](#rollback-procedures)
10. [Monitoring & Logs](#monitoring--logs)
11. [Troubleshooting](#troubleshooting)

---

## Overview

**Deployment Platform**: AWS Amplify Hosting  
**Infrastructure**: AWS Amplify Gen 2 (using AWS CDK)  
**Region**: `eu-north-1` (Stockholm, Sweden)  
**Build System**: Vite + TypeScript  
**Backend**: Serverless (Lambda + API Gateway + DynamoDB)

### Deployment Flow

```
Developer → Git Push → Amplify Console → Build → Deploy → Live
```

### Key Concepts

- **Branch-based deployments**: Each Git branch gets its own environment
- **Atomic deployments**: Backend and frontend deployed together
- **Zero-downtime**: Blue/green deployment strategy
- **Automatic rollback**: Failed builds don't affect production

---

## Deployment Environments

### Environment Types

| Environment | Git Branch | Purpose | Auto-Deploy | URL Pattern |
|-------------|-----------|---------|-------------|-------------|
| **Sandbox** | Local | Per-developer testing | No (manual) | `localhost:5173` |
| **Main/Production** | `main` | Production environment | Yes | `https://main.{app-id}.amplifyapp.com` |
| **Preview** | Feature branches | Pull request previews | Yes (on PR) | `https://{branch}.{app-id}.amplifyapp.com` |

### Environment Isolation

Each environment has:
- **Separate DynamoDB tables**: `leavs-{env}-user-profiles`, etc.
- **Separate Cognito User Pool**: Independent user databases
- **Separate API Gateway**: Unique API endpoints
- **Separate Lambda functions**: Isolated compute

**Example**:
- Production: `leavs-main-user-profiles`
- Preview (branch `feature-xyz`): `leavs-feature-xyz-user-profiles`

---

## CI/CD Pipeline

### Pipeline Configuration

Defined in `amplify.yml`:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci                              # Install dependencies
        
        build:
          commands:
            # 1. Deploy backend infrastructure
            - npx ampx pipeline-deploy --app-id $AWS_APP_ID --branch $AWS_BRANCH
            
            # 2. Generate runtime configuration
            - npx ampx generate outputs --app-id $AWS_APP_ID --branch $AWS_BRANCH --format json --outputs-version 1.4
            
            # 3. Copy config to public folder (accessible at runtime)
            - cp amplify_outputs.json public/amplify_outputs.json
            
            # 4. Build frontend
            - npm run build
      
      artifacts:
        baseDirectory: build                      # Output directory
        files:
          - '**/*'                                # Deploy all files
      
      cache:
        paths:
          - node_modules/**/*                     # Cache dependencies
    
    appRoot: .                                    # Root directory
```

### Build Phases

#### 1. preBuild

**Purpose**: Install dependencies

**Commands**:
```bash
npm ci  # Clean install (uses package-lock.json)
```

**Duration**: ~30 seconds (with cache), ~2 minutes (without cache)

#### 2. Build

**Step 1: Deploy Backend**
```bash
npx ampx pipeline-deploy --app-id $AWS_APP_ID --branch $AWS_BRANCH
```

- Creates/updates CloudFormation stacks
- Deploys Lambda functions
- Creates DynamoDB tables (if not exist)
- Sets up API Gateway
- Configures Cognito

**Duration**: ~3-5 minutes (first deploy), ~1-2 minutes (updates)

**Step 2: Generate Configuration**
```bash
npx ampx generate outputs --app-id $AWS_APP_ID --branch $AWS_BRANCH --format json --outputs-version 1.4
```

- Generates `amplify_outputs.json` with:
  - Cognito User Pool details
  - API Gateway endpoint
  - Region information
  - Auth configuration

**Duration**: ~5 seconds

**Step 3: Copy Configuration**
```bash
cp amplify_outputs.json public/amplify_outputs.json
```

- Makes config accessible at `/amplify_outputs.json` URL
- Frontend fetches this at runtime to initialize Amplify

**Duration**: Instant

**Step 4: Build Frontend**
```bash
npm run build
```

- Runs: `vite build`
- TypeScript compilation
- Bundling and minification
- Asset optimization
- Output to `build/` directory

**Duration**: ~30 seconds

#### 3. Artifacts

- **Source**: `build/` directory
- **Files**: All files (`**/*`)
- **Deployed to**: S3 bucket + CloudFront CDN

#### 4. Cache

- **Cached**: `node_modules/`
- **Purpose**: Speed up future builds
- **Invalidation**: When `package-lock.json` changes

### Pipeline Execution

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Git Push to Branch                                        │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Amplify Console Webhook Triggered                         │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Provision Build Environment                               │
│    - Amazon Linux 2 container                                │
│    - Node.js 18                                              │
│    - npm 9                                                   │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Run preBuild Phase                                        │
│    - npm ci (install dependencies)                           │
│    Duration: ~30s (cached) / ~2min (no cache)                │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Run Build Phase                                           │
│    Step 1: Deploy backend (~3-5 min first, ~1-2 min update)  │
│    Step 2: Generate outputs (~5s)                            │
│    Step 3: Copy to public (~instant)                         │
│    Step 4: Build frontend (~30s)                             │
│    Total Duration: ~4-6 minutes                              │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Deploy to S3 + CloudFront                                 │
│    - Upload files to S3 bucket                               │
│    - Invalidate CloudFront cache                             │
│    Duration: ~30s                                            │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Test Deployment (Health Checks)                           │
│    - HTTP 200 response check                                 │
│    Duration: ~10s                                            │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. Go Live (Switch DNS/CloudFront)                           │
│    - Blue/green swap                                         │
│    - Zero downtime                                           │
│    Duration: Instant                                         │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ ✅ Deployment Complete                                        │
│    Total Time: ~5-7 minutes                                  │
└──────────────────────────────────────────────────────────────┘
```

### Pipeline Triggers

| Trigger | Action | Environment |
|---------|--------|-------------|
| Push to `main` | Auto-deploy production | Production |
| Push to feature branch | Auto-deploy preview (if configured) | Preview |
| Pull request created | Auto-deploy preview | Preview |
| Manual deploy | Click "Redeploy" in Console | Any |

---

## Local Development

### Prerequisites

- **Node.js**: 16+ (recommended: 18 LTS)
- **npm**: 9+
- **AWS CLI**: 2.x (for sandbox commands)
- **Git**: 2.x

### Setup Steps

#### 1. Clone Repository

```bash
git clone https://github.com/your-org/student-hub.git
cd student-hub
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Run Development Server (Frontend Only)

```bash
npm run dev
```

- Starts Vite dev server on `http://localhost:5173`
- Hot module replacement (HMR) enabled
- No backend, authentication won't work

#### 4. Run with Sandbox Backend (Full Stack)

**Terminal 1: Start Sandbox**
```bash
npm run sandbox
```

This command:
- Deploys a personal sandbox environment to AWS
- Creates unique DynamoDB tables (with your username)
- Generates `amplify_outputs.json` in project root
- Watches for backend code changes
- Takes ~3-5 minutes to start

**Terminal 2: Start Frontend**
```bash
npm run dev
```

- Frontend reads `amplify_outputs.json`
- Full authentication and API access
- Changes trigger HMR

**When to use**:
- Testing authentication
- Testing API endpoints
- Testing onboarding flow
- Full integration testing

### Development Workflow

```
1. Start sandbox (once per session)
   npm run sandbox
   ● Wait for "Deployed" message ●

2. Start dev server (in another terminal)
   npm run dev
   ● Visit http://localhost:5173 ●

3. Make code changes
   ● Frontend: HMR auto-reloads ●
   ● Backend: Sandbox auto-deploys ●

4. Test changes in browser

5. Stop sandbox (Ctrl+C when done)
   ● Keeps resources in AWS ●
   ● Can resume later ●
```

---

## Sandbox Deployment

### What is a Sandbox?

A **sandbox** is a personal, ephemeral AWS environment for each developer.

**Characteristics**:
- **Isolated**: Your own DynamoDB tables, Cognito pool, etc.
- **Temporary**: Can be deleted anytime
- **Cloud-based**: Runs on real AWS infrastructure
- **Full-featured**: Identical to production

### Creating a Sandbox

```bash
npm run sandbox
```

**What happens**:
1. Amplify CLI authenticates you with AWS
2. Creates a unique sandbox name: `yourusername-sandbox-{hash}`
3. Deploys CloudFormation stack with all resources
4. Generates `amplify_outputs.json`
5. Watches for backend changes

**First run**: ~5 minutes  
**Subsequent runs**: ~30 seconds (resources already exist)

### Sandbox Resources

When you run `npm run sandbox`, AWS creates:

| Resource | Name Pattern | Purpose |
|----------|--------------|---------|
| **Lambda** | `amplify-{sandbox-id}-userApi` | API handler |
| **DynamoDB Tables** | `leavs-sandbox-user-profiles` | User data |
| **API Gateway** | `LeavsRestApi-{sandbox-id}` | REST endpoints |
| **Cognito User Pool** | `amplify-{sandbox-id}` | Authentication |

### Sandbox Command Reference

```bash
# Start sandbox (deploy + watch)
npm run sandbox

# Generate outputs only (after sandbox running)
npm run amplify:outputs

# Same as amplify:outputs
npm run amplify:pull

# Delete your sandbox (cleanup)
npx ampx sandbox delete
```

### Sandbox Costs

**Free Tier Eligible**: Yes

**Estimated Cost** (per month, per developer):
- **DynamoDB**: Free (under 25GB storage, 25 read/write units)
- **Lambda**: Free (1M requests/month included)
- **API Gateway**: Free (1M requests/month included)
- **Cognito**: Free (50,000 MAU included)
- **Total**: $0/month (under free tier limits)

**After free tier**:
- ~$5-10/month per developer (light usage)

---

## Production Deployment

### Initial Setup

#### 1. Connect Repository to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect GitHub repository
4. Select repository and `main` branch
5. Amplify auto-detects build settings from `amplify.yml`
6. Click "Save and deploy"

#### 2. Configure Environment

In Amplify Console → App Settings → Environment variables:

| Name | Value | Description |
|------|-------|-------------|
| `AWS_APP_ID` | (auto-set) | Amplify app ID |
| `AWS_BRANCH` | (auto-set) | Git branch name |
| `FEEDBACK_EMAIL` | `tijn@eendenburg.eu` | Email for feedback notifications |

#### 3. Set Up Domain (Optional)

1. Amplify Console → Domain management
2. Add custom domain (e.g., `studenthub.com`)
3. Amplify auto-provisions SSL certificate
4. Update DNS records as instructed
5. Wait ~15 minutes for propagation

### Deployment Process

#### Automatic Deployment

```
Developer pushes to main
     │
     ▼
GitHub webhook triggers Amplify
     │
     ▼
Amplify runs build (amplify.yml)
     │
     ├─ Deploy backend (CloudFormation)
     ├─ Generate outputs
     ├─ Build frontend (Vite)
     └─ Deploy to S3 + CloudFront
     │
     ▼
Production live with new changes
```

**Duration**: ~5-7 minutes

#### Manual Deployment

1. Go to Amplify Console → App → Branch (`main`)
2. Click "Redeploy this version"
3. Confirm deployment
4. Wait for build to complete

### Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Code reviewed and approved
- [ ] Environment variables verified
- [ ] Database migrations tested (if any)
- [ ] Breaking changes documented
- [ ] Rollback plan ready
- [ ] Monitoring alerts configured

### Post-Deployment Verification

After deployment completes:

1. **Health Check**: Visit homepage, verify loads
2. **Authentication**: Sign in with test account
3. **API Endpoints**: Test critical API calls
4. **Database**: Verify data persists correctly
5. **Error Monitoring**: Check CloudWatch for errors
6. **Performance**: Check page load times

---

## Environment Variables

### Frontend Environment Variables

**Not used directly in frontend code** (security risk).

Configuration loaded from `/amplify_outputs.json` at runtime.

### Backend Environment Variables

Set automatically by `amplify/backend.ts`:

| Variable | Value | Set By |
|----------|-------|--------|
| `USER_PROFILE_TABLE_NAME` | `leavs-{env}-user-profiles` | CDK |
| `USER_PROGRESS_TABLE_NAME` | `leavs-{env}-user-progress` | CDK |
| `FEEDBACK_TABLE_NAME` | `leavs-{env}-feedback` | CDK |
| `DEADLINES_TABLE_NAME` | `leavs-{env}-deadlines` | CDK |
| `FEEDBACK_EMAIL` | `tijn@eendenburg.eu` | CDK |

### Adding New Environment Variables

#### 1. Add to `amplify/backend.ts`

```typescript
backend.userApi.resources.lambda.addEnvironment(
  'NEW_VARIABLE_NAME',
  'new-variable-value'
)
```

#### 2. Use in Lambda Handler

```typescript
const newVar = process.env.NEW_VARIABLE_NAME
```

#### 3. Deploy

```bash
# Sandbox
npm run sandbox

# Production (commit and push)
git add amplify/backend.ts
git commit -m "Add NEW_VARIABLE_NAME environment variable"
git push origin main
```

---

## Build Process

### Local Build

```bash
npm run build
```

**Output**: `build/` directory

**Steps**:
1. **Pre-build**: `node scripts/copy-amplify-outputs.mjs` (copies outputs to public)
2. **TypeScript Compilation**: `tsc` (type checking)
3. **Vite Build**: `vite build` (bundling, minification)

**Result**:
```
build/
├── index.html                    # Entry point
├── assets/
│   ├── index-{hash}.js           # Main JS bundle (~300KB gzipped)
│   ├── index-{hash}.css          # Styles (~50KB gzipped)
│   └── ...                       # Other chunks
├── amplify_outputs.json          # Runtime config
└── robots.txt, sitemap.xml       # SEO files
```

### Production Build Optimizations

Vite automatically applies:

- **Code Splitting**: Routes split into separate chunks
- **Tree Shaking**: Remove unused code
- **Minification**: Terser for JS, cssnano for CSS
- **Asset Hashing**: Cache-busting filenames
- **Gzip Compression**: CloudFront applies brotli/gzip

### Build Size Analysis

```bash
# Build with analysis
npm run build -- --mode production

# Output shows bundle sizes
# vite v5.0.8 building for production...
# ✓ 789 modules transformed.
# build/index.html                    1.23 kB │ gzip:   0.56 kB
# build/assets/index-C_t0luVZ.css    85.67 kB │ gzip:  15.34 kB
# build/assets/index-ysO9iqAv.js    325.45 kB │ gzip:  98.23 kB
```

**Target**: Keep main bundle under 500KB (gzipped < 150KB)

---

## Rollback Procedures

### Automatic Rollback

If build fails:
- Amplify keeps previous version live
- No downtime
- Error shown in Amplify Console

### Manual Rollback

#### Option 1: Redeploy Previous Version

1. Go to Amplify Console → Build history
2. Find last successful build
3. Click "Redeploy this version"
4. Wait ~5 minutes

#### Option 2: Git Revert + Push

```bash
# Revert to previous commit
git revert HEAD

# Push revert commit
git push origin main

# Amplify auto-deploys reverted version
```

#### Option 3: Rollback CloudFormation Stack

**Use with caution** (affects backend only):

1. Go to CloudFormation Console
2. Find stack: `amplify-studenthub-{branch}-{hash}`
3. Select stack → Actions → "Create change set for current stack"
4. Choose "Use existing template"
5. Update to previous stack version
6. Execute change set

### Rollback Checklist

After rollback:

- [ ] Verify homepage loads
- [ ] Test authentication
- [ ] Check API endpoints
- [ ] Monitor error rates
- [ ] Notify team of rollback
- [ ] Identify root cause
- [ ] Create hotfix if needed

---

## Monitoring & Logs

### CloudWatch Logs

#### Lambda Logs

**Log Group**: `/aws/lambda/amplify-{app-id}-{branch}--userApi{hash}`

**Access**:
1. Go to CloudWatch Console
2. Logs → Log groups
3. Search for `amplify`
4. Select log group
5. View log streams

**Common Log Entries**:
```
[Handler] Received request: PUT /user/me
PUT /user/me error: {error details}
```

**Retention**: 7 days (default)

#### API Gateway Logs

**Not enabled by default** (adds cost)

To enable:
1. API Gateway Console → Your API
2. Stages → prod
3. Logs/Tracing → Enable CloudWatch Logs
4. Set log format to JSON

### Metrics

#### Lambda Metrics

- **Invocations**: Request count
- **Duration**: Execution time (avg, p50, p99)
- **Errors**: Error count and rate
- **Throttles**: Concurrent execution limit hits
- **Cold Starts**: First invocation delays

**Access**: CloudWatch → Metrics → Lambda

#### API Gateway Metrics

- **Count**: Total requests
- **Latency**: Response time (avg, p50, p99)
- **4XXError**: Client errors
- **5XXError**: Server errors

**Access**: CloudWatch → Metrics → API Gateway

### Alarms (Recommended Setup)

Create CloudWatch Alarms for:

1. **High Error Rate**
   - Metric: Lambda Errors
   - Threshold: > 5% error rate
   - Period: 5 minutes
   - Action: SNS notification

2. **High Latency**
   - Metric: API Gateway Latency (p99)
   - Threshold: > 3000ms
   - Period: 5 minutes
   - Action: SNS notification

3. **High Throttling**
   - Metric: Lambda Throttles
   - Threshold: > 10 throttles
   - Period: 5 minutes
   - Action: SNS notification

### Log Analysis Tips

**Find errors**:
```bash
# Using AWS CLI
aws logs filter-log-events \
  --log-group-name "/aws/lambda/amplify-xxx-userApi" \
  --filter-pattern "ERROR"
```

**Find slow requests**:
```bash
aws logs filter-log-events \
  --log-group-name "/aws/lambda/amplify-xxx-userApi" \
  --filter-pattern "Duration"
```

---

## Troubleshooting

### Build Failures

#### "npm ci failed"

**Cause**: Dependencies cannot be installed

**Solutions**:
1. Check `package-lock.json` is committed
2. Remove `node_modules` from `.gitignore` (if added)
3. Run `npm install` locally, commit lock file

#### "amplify_outputs.json not found"

**Cause**: Backend deployment failed

**Solutions**:
1. Check CloudFormation stack status in AWS Console
2. Look for errors in Amplify build logs
3. Verify IAM permissions for Amplify service role
4. Try deploying backend manually: `npx ampx sandbox`

#### "vite build failed"

**Cause**: TypeScript compilation errors

**Solutions**:
1. Run `npm run build` locally to reproduce
2. Fix TypeScript errors shown
3. Run `tsc --noEmit` to check types
4. Commit fixes and push

### Runtime Errors

#### "Failed to fetch configuration"

**Cause**: `/amplify_outputs.json` not accessible

**Solutions**:
1. Verify `public/amplify_outputs.json` exists in build
2. Check pre-build script ran: `scripts/copy-amplify-outputs.mjs`
3. Clear CloudFront cache

#### "Auth UserPool not configured"

**Cause**: `amplify_outputs.json` missing auth config

**Solutions**:
1. Regenerate outputs: `npm run amplify:outputs`
2. Check Cognito User Pool exists in AWS Console
3. Verify `auth` resource defined in `amplify/backend.ts`

#### "API Gateway returned 404"

**Cause**: Route not configured or wrong endpoint

**Solutions**:
1. Check API endpoint in `amplify_outputs.json`
2. Verify route defined in `amplify/backend.ts`
3. Check Lambda logs for [Handler] message
4. Ensure path matches exactly (e.g., `/user/me` not `/user/me/`)

### Performance Issues

#### "Slow page loads"

**Solutions**:
1. Check CloudFront cache hit rate
2. Optimize images (use WebP, lazy loading)
3. Enable code splitting for large pages
4. Review bundle size: `npm run build`

#### "High Lambda latency"

**Solutions**:
1. Check DynamoDB query patterns (avoid scans)
2. Enable Lambda provisioned concurrency (reduces cold starts)
3. Optimize Lambda code (reduce dependencies)
4. Add caching layer (ElastiCache)

### Database Issues

#### "DynamoDB throttling"

**Cause**: Too many requests exceeding on-demand capacity

**Solutions**:
1. Check DynamoDB metrics in CloudWatch
2. Switch to provisioned capacity if predictable load
3. Add exponential backoff in Lambda
4. Reduce write frequency (batch updates)

#### "Data not persisting"

**Solutions**:
1. Check Lambda has DynamoDB write permissions
2. Verify table name matches environment variable
3. Check CloudWatch logs for PutItem errors
4. Verify partition key matches schema

---

## Production Checklist

### Pre-Launch

- [ ] Custom domain configured (e.g., `studenthub.com`)
- [ ] SSL certificate provisioned (automatic via Amplify)
- [ ] Environment variables set correctly
- [ ] CORS origins restricted (not `*` in production)
- [ ] Rate limiting enabled on API Gateway
- [ ] CloudWatch alarms configured
- [ ] Backup strategy in place (DynamoDB Point-in-Time Recovery)
- [ ] Error tracking set up (Sentry, LogRocket, etc.)
- [ ] Analytics integrated (Google Analytics, Amplitude, etc.)
- [ ] SEO tags added (meta descriptions, Open Graph)
- [ ] robots.txt and sitemap.xml in place
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Privacy policy and terms of service added

### Post-Launch

- [ ] Monitor CloudWatch for errors/latency spikes
- [ ] Check real user metrics (Core Web Vitals)
- [ ] Verify authentication works for new users
- [ ] Test end-to-end user flows
- [ ] Monitor DynamoDB costs
- [ ] Review Lambda cold start metrics
- [ ] Set up regular database backups
- [ ] Document incident response procedures

---

## Cost Optimization

### Current Costs (Estimated)

**Assumptions**: 1,000 active users, 100,000 requests/month

| Service | Usage | Cost |
|---------|-------|------|
| **Amplify Hosting** | 1 app | $0 (free tier) |
| **CloudFront** | 5GB transfer | $0.43 |
| **S3** | 1GB storage | $0.02 |
| **Lambda** | 100K requests, 2s avg | $0.24 |
| **API Gateway** | 100K requests | $0.35 |
| **DynamoDB** | On-demand | $1.25 (25GB storage, 100K writes) |
| **Cognito** | 1,000 MAU | $0 (free tier) |
| **SES** | 200 emails | $0.02 |
| **Total** | | **~$2-3/month** |

### Scaling Costs

At 10,000 users, 1M requests/month:
- **Lambda**: ~$2.50
- **API Gateway**: ~$3.50
- **DynamoDB**: ~$12.50
- **Total**: **~$20-25/month**

### Cost Reduction Tips

1. **Enable CloudFront caching** (reduce origin requests)
2. **Use DynamoDB reserved capacity** (if predictable load)
3. **Optimize Lambda memory** (reduce execution time)
4. **Batch DynamoDB writes** (reduce request count)
5. **Archive old logs** (reduce CloudWatch storage)

---

## Security Considerations

### Production Security Checklist

- [ ] HTTPS enforced (Amplify does this automatically)
- [ ] CORS origins restricted to production domain
- [ ] API Gateway throttling enabled (1,000 req/s per user)
- [ ] Cognito MFA enabled (optional, recommended for admins)
- [ ] DynamoDB encryption at rest enabled (KMS)
- [ ] Lambda environment variables encrypted
- [ ] CloudTrail logging enabled (audit trail)
- [ ] IAM roles follow least privilege principle
- [ ] Secrets stored in AWS Secrets Manager (not env vars)
- [ ] Regular security audits scheduled

---

## Support & Resources

### Documentation

- [AWS Amplify Docs](https://docs.amplify.aws/)
- [AWS CDK Docs](https://docs.aws.amazon.com/cdk/)
- [Vite Docs](https://vitejs.dev/)

### AWS Console Links

- [Amplify Console](https://console.aws.amazon.com/amplify/)
- [CloudFormation](https://console.aws.amazon.com/cloudformation/)
- [Lambda](https://console.aws.amazon.com/lambda/)
- [DynamoDB](https://console.aws.amazon.com/dynamodb/)
- [CloudWatch](https://console.aws.amazon.com/cloudwatch/)

### Contact

**For support**: tijn@eendenburg.eu

---

**End of Deployment Guide**
