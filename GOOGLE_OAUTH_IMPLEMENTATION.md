# Google OAuth Sign-In Implementation - Complete Guide

## Overview
This document outlines the complete Google OAuth 2.0 implementation for user authentication with role selection (Buyer/Seller) requirement.

## Architecture

### Frontend Flow
1. User clicks "Sign in with Google" button
2. Google Identity Services renders button or prompts OAuth dialog
3. User authenticates with Google account
4. Frontend receives `id_token` from Google
5. Frontend sends `id_token` to backend `/api/auth/google` endpoint
6. Backend verifies token and creates/updates user
7. If new user without role:
   - Backend returns `isNewUser: true, role: null`
   - Frontend redirects to `/signUp` with `googleAuthNewUser` flag in localStorage
   - SignUp page shows simplified "Complete Your Profile" form with role selection only
   - User selects role and submits
   - Frontend calls `PUT /api/auth/set-role` to update role
   - User is redirected to appropriate dashboard
8. If existing user with role:
   - User is directly redirected to dashboard

### Backend Flow
1. `/api/auth/google` endpoint receives `id_token`
2. Uses OAuth2Client from google-auth-library to verify token
3. Extracts user info: email, name, picture, sub (Google ID)
4. Finds or creates user in MongoDB
5. Issues JWT token and sets httpOnly cookie
6. Returns user object with `isNewUser` flag

## Files Modified

### 1. Backend: `/backend/src/routes/auth.routes.js`

**Key Endpoints:**

#### POST `/api/auth/google`
- Verifies Google ID token using OAuth2Client
- Creates new user with `role: null` if first-time user
- Returns `isNewUser` flag to indicate need for role selection
- Issues JWT token

```javascript
router.post("/google", async (req, res) => {
  // Verify token with Google's library
  const ticket = await googleClient.verifyIdToken({ 
    idToken: id_token, 
    audience: process.env.GOOGLE_CLIENT_ID 
  });
  
  // Create or update user
  // Return user with isNewUser flag
  return res.json({ user: publicUser });
});
```

#### PUT `/api/auth/set-role`
- Protected by `ensureAuth` middleware (requires valid JWT)
- Updates user's role from `null` to either `"client"` or `"freelancer"`
- Returns updated user object with new role

```javascript
router.put("/set-role", ensureAuth, async (req, res) => {
  const { role } = req.body;
  
  // Update role in database
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { role, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  
  return res.json({ user: publicUser });
});
```

**Dependencies:**
- `google-auth-library` - OAuth2Client for token verification
- `ensureAuth` middleware - JWT verification for protected routes

### 2. Frontend: `/frontend/src/pages/signUp.jsx`

**Key Features:**

1. **Google Mode Detection**
   - Checks if `googleAuthNewUser` flag is in localStorage
   - Sets `isGoogleMode` state to show simplified form
   - Hides name, email, password fields when in Google mode

2. **Simplified Google Mode UI**
   - Shows only "Complete Your Profile" heading
   - Displays role selection toggle
   - Shows submit button labeled "Complete Sign Up"
   - Hides "OR" divider and Google sign-in button

3. **Form Submission Logic**
   ```javascript
   if (isGoogleAuthNewUser) {
     // Call PUT endpoint to set role
     const response = await api.put("/api/auth/set-role", { role: backendRole });
     const { user } = response;
     
     // Clear Google auth flag
     localStorage.removeItem('googleAuthNewUser');
     
     // Store role and redirect
     localStorage.setItem('role', user.role);
     const dest = user.role === 'client' 
       ? '/client/overview' 
       : '/freelancer/overview';
     navigate(dest, { replace: true });
   } else {
     // Regular signup flow
   }
   ```

4. **Enhanced Logging**
   - Console logs at each step for debugging
   - Shows selected role, destination, and navigation status
   - Logs full response from API calls

### 3. Frontend: `/frontend/src/pages/Signin.jsx`

**Key Changes:**

1. **Google Response Handler Updates**
   - Detects new Google users (`user.isNewUser && !user.role`)
   - Redirects to `/signUp` with `googleAuthNewUser` flag instead of showing error
   - Existing users redirected directly to dashboard

2. **Improved Error Handling**
   - Distinguishes between new users and authentication errors
   - Provides clear messaging for role selection requirement

### 4. Environment Configuration

**Frontend: `/frontend/.env`**
```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_GOOGLE_CLIENT_ID=729914588358-op1vi6e90q52qbphe7mobtl08mobu2is.apps.googleusercontent.com
```

**Backend: `/backend/.env`**
```
GOOGLE_CLIENT_ID=729914588358-op1vi6e90q52qbphe7mobtl08mobu2is.apps.googleusercontent.com
FRONTEND_ORIGIN=http://localhost:3000
```

## Complete User Flow

### New User First-Time Google Sign-In

```
1. User visits frontend → clicks Google button
   ↓
2. Google Identity Services dialog appears
   ↓
3. User authenticates with Google
   ↓
4. Frontend receives id_token from Google
   ↓
5. Frontend POST /api/auth/google { id_token }
   ↓
6. Backend verifies token with Google
   ↓
7. Backend creates user with role: null
   ↓
8. Backend returns { user: {..., role: null, isNewUser: true} }
   ↓
9. Frontend detects isNewUser flag
   ↓
10. Frontend sets localStorage.googleAuthNewUser = 'true'
    ↓
11. Frontend redirects to /signUp
    ↓
12. SignUp page loads
    ↓
13. useEffect checks localStorage.googleAuthNewUser
    ↓
14. Sets isGoogleMode = true
    ↓
15. UI changes to show only role selection form
    ↓
16. User selects role (Buyer/Seller)
    ↓
17. User clicks "Complete Sign Up"
    ↓
18. handleSubmit runs with isGoogleAuthNewUser = true
    ↓
19. Frontend PUT /api/auth/set-role { role: "client" | "freelancer" }
    ↓
20. Backend updates user role in database
    ↓
21. Backend returns { user: {..., role: "client"} }
    ↓
22. Frontend clears googleAuthNewUser flag
    ↓
23. Frontend stores role in localStorage
    ↓
24. Frontend redirects to /client/overview or /freelancer/overview
    ↓
25. Dashboard displays
```

### Existing User Google Sign-In

```
1. User clicks Google button
   ↓
2. User authenticates
   ↓
3. Frontend POST /api/auth/google
   ↓
4. Backend finds existing user with role already set
   ↓
5. Backend returns { user: {..., role: "client", isNewUser: false} }
   ↓
6. Frontend detects isNewUser = false
   ↓
7. Frontend directly redirects to dashboard
   ↓
8. User sees dashboard (no role selection required)
```

## Database Schema

### User Document Structure

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String | null,  // null for Google users (no password)
  role: String | null,           // "client", "freelancer", or null for new Google users
  avatar: String | null,
  googleId: String | null,       // Google unique identifier
  city_id: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

1. **Token Verification**
   - Google ID token verified using OAuth2Client library
   - Ensures token authenticity before user creation

2. **JWT Protection**
   - `PUT /api/auth/set-role` protected by `ensureAuth` middleware
   - Requires valid JWT cookie before allowing role update
   - Only the authenticated user can update their own role

3. **httpOnly Cookies**
   - JWT stored in httpOnly, Secure, SameSite cookies
   - Prevents XSS attacks and unauthorized token access

4. **CORS Configuration**
   - Backend allows credentials with frontend origin
   - Prevents unauthorized cross-origin requests

## Testing the Flow

### Manual Testing Steps

1. **New User First-Time Sign-In:**
   ```bash
   # Delete test user from database
   node scripts/deleteUser.js
   
   # Start frontend and backend
   npm start (in frontend and backend directories)
   
   # Navigate to signup page
   # Click Google button
   # Authenticate with Google account (new account)
   # Verify redirected to /signUp with role selection
   # Select role
   # Click "Complete Sign Up"
   # Verify redirected to appropriate dashboard
   ```

2. **Existing User Sign-In:**
   ```bash
   # Create user with previous step
   # Sign out
   # Navigate to signin page
   # Click Google button
   # Verify directly redirected to dashboard (no role selection)
   ```

## Debugging Console Logs

The implementation includes detailed console logging:

### Frontend SignUp Page
```
✅ Google Identity script loaded
✅ Google Identity initialized
✅ Google button rendered
📨 Google response received
🔒 Sending token to backend...
📥 PUT /api/auth/set-role response: {...}
👤 User from response: {...}
👤 user.role: "client"
🎯 Destination: /client/overview
🚀 About to navigate to: /client/overview
```

### Backend Auth Routes
```
[Google Auth] Request received
[Google Auth] Verifying token with Google...
[Google Auth] Token verified. Payload: {...}
[Google Auth] User found: ObjectId
[Google Auth] Success! User logged in: userId
[Set Role] User role updated: userId => client
```

## Troubleshooting

### Issue: "Google signin is not configured"
**Solution:** Ensure `REACT_APP_GOOGLE_CLIENT_ID` is set in `/frontend/.env` and Google Identity script loads successfully.

### Issue: "Invalid_client" error
**Solution:** Verify `http://localhost:3000` is added as authorized redirect URI in Google Cloud Console OAuth configuration.

### Issue: User redirected to homepage instead of dashboard
**Solution:** Check browser console logs for errors in `handleSubmit`. Verify `PUT /api/auth/set-role` returns updated user with role set.

### Issue: Role stays null after selection
**Solution:** 
1. Verify `ensureAuth` middleware correctly extracts user ID from JWT
2. Check `PUT /api/auth/set-role` response includes updated role
3. Verify MongoDB connection and user update query

## Dependencies

### Backend
- `google-auth-library` - OAuth2Client for token verification
- `bcryptjs` - Password hashing (still used for regular signup)
- `express` - Web framework
- `mongodb` - Database
- `jsonwebtoken` - JWT handling

### Frontend
- `react` - UI framework
- `react-router-dom` - Routing and navigation
- Custom `api` module for HTTP requests
- Google Identity Services script (loaded dynamically)

## Future Improvements

1. **Add email verification** - Send verification email to new Google users
2. **Social linking** - Allow linking Google account to existing account
3. **Additional OAuth providers** - Add GitHub, Microsoft sign-in
4. **Account recovery** - Implement password reset for regular signup users
5. **Profile completion** - Collect additional profile info after role selection
