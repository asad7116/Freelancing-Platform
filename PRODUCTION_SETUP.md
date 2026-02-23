# Production Deployment Configuration Guide

## Overview
Your application is deployed with:
- **Frontend**: https://tixe.dev (S3 Static Hosting)
- **Backend**: https://api.tixe.dev (AWS ECS)

## Changes Made

### 1. Backend Configuration (`backend/.env`)
```env
FRONTEND_ORIGIN=https://tixe.dev
```
This tells your backend to accept requests from your production frontend.

### 2. Frontend Configuration

#### a. Environment Variable (`.env.production`)
Already configured:
```env
REACT_APP_API_URL=https://api.tixe.dev
```

#### b. Axios Configuration (`src/config/axios.js`)
Created a global axios configuration that sets the base URL automatically.

#### c. API Helper (`src/lib/api.js`)
Exported `API_BASE_URL` and `buildApiUrl()` helper for fetch calls.

### 3. Updated Components
- ✅ `BrowseJobs.jsx`
- ✅ `dashboard.jsx`
- ✅ `gigs_dashboard.jsx`

## Remaining Components to Update

You have ~20+ components still using hardcoded paths like `/api/...`. 

### Quick Fix Options:

#### **Option A: Global Search & Replace (Recommended)**

For **fetch** calls, replace:
```javascript
fetch('/api/
```
With:
```javascript
fetch(`${API_BASE_URL}/api/
```

And add this import at the top:
```javascript
import { API_BASE_URL } from '../lib/api';
```

#### **Option B: Use buildApiUrl helper**
```javascript
import { buildApiUrl } from '../lib/api';

// Instead of:
fetch('/api/gigs')

// Use:
fetch(buildApiUrl('/api/gigs'))
```

### For Axios Calls:
The axios configuration in `src/config/axios.js` is imported in `index.js`, so all axios calls should automatically use the correct base URL. **No changes needed for axios!**

## Files That Still Need Updates (fetch calls only)

1. `src/pages/SubmitProposal.jsx`
2. `src/pages/Dashboard/ProfileSettings.jsx`
3. `src/pages/Dashboard/FreelancerProfileSetup.jsx`
4. `src/pages/Dashboard/CreateGig.jsx`
5. `src/pages/Checkout.jsx`
6. `src/components/PostJobFormEnhanced.jsx`
7. `src/components/PostJobForm.jsx`
8. `src/components/orders_dashboard.jsx`
9. `src/components/my_jobs_dashboard.jsx`
10. `src/components/MyProposalsFreelancer.jsx`
11. `src/components/ClientProposalsList.jsx`
12. `src/components/BrowseGigs.jsx`
13. `src/components/AI/BidAnalyzer.jsx`
14. `src/components/AI/JobSkillsSuggester.jsx`
15. `src/components/AI/JobDescriptionEnhancer.jsx`
16. `src/components/AI/JobBudgetRecommender.jsx`
17. `src/components/AI/GigAnalyzer.jsx`

## Deployment Steps

### 1. Update Backend Environment Variables in AWS ECS
Make sure your ECS task definition or container environment has:
```
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
FRONTEND_ORIGIN=https://tixe.dev
PORT=4000
REACT_APP_GOOGLE_CLIENT_ID=<if_using_google_oauth>
GROQ_API_KEY=<if_using_groq>
OPENAI_API_KEY=<if_using_openai>
```

### 2. Build and Deploy Frontend
```bash
cd frontend
npm run build
# Upload the build folder to S3
aws s3 sync build/ s3://your-bucket-name --delete
```

### 3. Restart Backend (if needed)
Restart your ECS service to pick up the new environment variables.

## Testing

1. Open https://tixe.dev
2. Try logging in
3. Check browser console for any errors
4. Verify API calls are going to https://api.tixe.dev (check Network tab)

## Common Issues

### Issue: Still seeing "Unexpected token '<'"
**Cause**: Some components still using relative paths `/api/...`
**Fix**: Update all fetch calls to use `${API_BASE_URL}/api/...`

### Issue: CORS errors
**Cause**: Backend `FRONTEND_ORIGIN` not set correctly
**Fix**: Update backend `.env` with `FRONTEND_ORIGIN=https://tixe.dev`

### Issue: 401 Unauthorized
**Cause**: Cookies not being sent/received
**Fix**: Ensure `credentials: 'include'` in fetch calls and proper CORS setup

## VS Code Find & Replace

To quickly update all files:

1. Press `Ctrl+Shift+H` (Find in Files)
2. Find: `fetch\(['"]/api`
3. Replace with: `fetch(\`\${API_BASE_URL}/api`
4. Enable regex search (.*) 
5. Review each match before replacing

Don't forget to add the import at the top of each file:
```javascript
import { API_BASE_URL } from '../lib/api'; // Adjust path as needed
```
