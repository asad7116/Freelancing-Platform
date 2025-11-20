# Google OAuth Testing Guide

## Prerequisites
- Node.js installed
- Frontend running on `http://localhost:3000`
- Backend running on `http://localhost:4000`
- MongoDB running locally
- `.env` files configured with Google Client ID

## Quick Test Checklist

### Setup
- [ ] Verify both frontend and backend are running
- [ ] Check `.env` files have `GOOGLE_CLIENT_ID` set
- [ ] Confirm MongoDB is running
- [ ] Clear browser cache/cookies if needed

### Test 1: New User First-Time Google Sign-In

**Steps:**
1. Delete any test user from database (use `deleteUser.js`)
2. Navigate to `http://localhost:3000/signUp`
3. Click the Google button (the "G" button)
4. Complete Google authentication with a NEW Google account
5. You should be redirected to `/signUp` page
6. Verify the page shows:
   - "Complete Your Profile" heading
   - Role selection toggle (Buyer/Seller)
   - "Complete Sign Up" button
   - NO name/email/password fields
7. Select "Buyer" role
8. Click "Complete Sign Up"
9. Verify redirect to `/client/overview` dashboard

**Expected Console Logs:**
```
✅ Google Identity script loaded
✅ Google Identity initialized
✅ Google button rendered
📨 Google response received
🔒 Sending token to backend...
📋 New user - showing role selection
✅ In Google auth mode - showing role selection only
📝 Setting role for Google auth user: client
📥 PUT /api/auth/set-role response: {...}
👤 User from response: {...}
👤 user.role: client
🎯 Destination: /client/overview
🚀 About to navigate to: /client/overview
```

**Backend Console Logs:**
```
[Google Auth] Request received
[Google Auth] Verifying token with Google...
[Google Auth] Token verified. Payload: {...}
[Google Auth] Creating new user...
[Google Auth] New user created: ObjectId
[Google Auth] Success! User logged in: userId
[Set Role] User role updated: userId => client
```

### Test 2: Existing User Google Sign-In

**Setup:**
- Complete Test 1 first to create a user

**Steps:**
1. Navigate to `http://localhost:3000/signin`
2. Click the Google button
3. Authenticate with the SAME Google account
4. Verify immediate redirect to `/client/overview` dashboard
5. Confirm NO role selection form is shown

**Expected Behavior:**
- Skip role selection entirely
- Redirect directly to dashboard

### Test 3: New User Via Sign-In Page

**Steps:**
1. Delete test user from database
2. Navigate to `http://localhost:3000/signin`
3. Click the Google button
4. Complete Google authentication with a NEW account
5. Verify redirect to `/signUp` with role selection
6. Select "Seller" role
7. Click "Complete Sign Up"
8. Verify redirect to `/freelancer/overview` dashboard

**Expected Result:**
- Same flow as Test 1, but with "Seller" role and freelancer dashboard

### Test 4: Verify Role Selection UI States

**For Buyer Role:**
- [ ] Role toggle shows "Buyer" selected
- [ ] "Selected role: Buyer" debug text displays
- [ ] Redirect goes to `/client/overview`
- [ ] Client dashboard loads

**For Seller Role:**
- [ ] Role toggle shows "Seller" selected
- [ ] "Selected role: Seller" debug text displays
- [ ] Redirect goes to `/freelancer/overview`
- [ ] Freelancer dashboard loads

## Debugging Commands

### Delete Test User
```bash
cd backend
node scripts/deleteUser.js
```

### Start Frontend
```bash
cd frontend
npm start
```

### Start Backend
```bash
cd backend
npm start
```

### Check Browser Console
1. Press F12 in browser
2. Go to Console tab
3. Look for 📨, ✅, ❌ emoji logs
4. Verify no red errors shown

### Check Backend Console
1. Look for `[Google Auth]` and `[Set Role]` prefixed logs
2. Verify token verification succeeded
3. Check user creation/update confirmed

## Common Issues & Fixes

### Issue: "Google signin is not configured"
**Fix:**
- Check `REACT_APP_GOOGLE_CLIENT_ID` in `/frontend/.env`
- Verify Google script loads in browser (check Network tab in DevTools)
- Clear browser cache and reload

### Issue: "401 Unauthorized" on /api/auth/set-role
**Fix:**
- Verify JWT cookie is being set (check Cookies in DevTools)
- Ensure backend receives valid JWT from POST /api/auth/google
- Check `ensureAuth` middleware is working

### Issue: User stays on /signUp page after clicking "Complete Sign Up"
**Fix:**
- Check browser console for JavaScript errors
- Verify PUT /api/auth/set-role returns 200 status
- Check backend logs for role update errors
- Verify navigate() is being called with correct path

### Issue: Redirect goes to homepage instead of dashboard
**Fix:**
- Check console logs show correct destination path
- Verify user.role is not null in response
- Check routing configuration in App.js
- Verify /client/overview and /freelancer/overview pages exist

### Issue: "Invalid_client" error from Google
**Fix:**
- Verify `GOOGLE_CLIENT_ID` in `/backend/.env` matches
- Check Google Cloud Console has correct client ID
- Ensure `http://localhost:3000` is authorized redirect URI
- Verify GOOGLE_CLIENT_ID matches between frontend and backend

## Performance Testing

### Measure Login Time
1. Open DevTools (F12)
2. Go to Network tab
3. Click Google button
4. Measure time until dashboard loads
5. Expected: < 5 seconds total

### Check Network Requests
Expected sequence:
1. Google Identity script load (early)
2. POST /api/auth/google (after OAuth)
3. Redirect to /signUp (immediate)
4. PUT /api/auth/set-role (after form submit)
5. Redirect to dashboard (immediate)

## Success Criteria

✅ All tests pass when:
- [ ] New users see role selection form
- [ ] Users select role and submit successfully
- [ ] Redirect to correct dashboard happens
- [ ] Existing users skip role selection
- [ ] No console errors or warnings
- [ ] Buyer selects go to `/client/overview`
- [ ] Seller selects go to `/freelancer/overview`
- [ ] JWT cookies are set with secure flags
- [ ] Backend logs show successful token verification
- [ ] MongoDB user records have correct role

## Next Steps After Testing

1. **If tests pass:**
   - Deploy to staging environment
   - Test with actual Google accounts
   - Test on different browsers (Chrome, Firefox, Safari)
   - Test on mobile devices

2. **If tests fail:**
   - Check debugging section above
   - Review browser and backend console logs
   - Verify all files were edited correctly
   - Ensure .env variables are set
   - Clear cache and restart both servers

3. **Production Deployment:**
   - Update Google Cloud Console authorized URIs to production domain
   - Update FRONTEND_ORIGIN in backend .env
   - Ensure HTTPS is used in production
   - Test complete flow in production environment
