# Profile Authentication Fix

## Issue
Profile picture upload and profile saving were failing with "authentication error" after migrating from PostgreSQL (Prisma) to MongoDB.

## Root Cause
The authentication middleware in `backend/src/routes/profile.routes.js` was calling `User.findById()` with only one parameter:
```javascript
const user = await User.findById(payload.sub)
```

However, the MongoDB-based User model requires **two parameters**:
```javascript
static async findById(db, id) {
  const users = db.collection("users")
  return await users.findOne({ _id: new ObjectId(id) })
}
```

## Solution
Updated the authentication middleware to:
1. Import the MongoDB database connection helper: `import { getDatabase } from "../db/mongodb.js"`
2. Get the database instance before querying: `const db = await getDatabase()`
3. Pass both required parameters: `const user = await User.findById(db, payload.sub)`
4. Attach both `_id` (ObjectId) and `id` (string) to `req.user` for controller compatibility

## Changes Made
**File:** `backend/src/routes/profile.routes.js`

### Before:
```javascript
import { User } from "../models/User.js"

const authMiddleware = async (req, res, next) => {
  // ... token verification ...
  const user = await User.findById(payload.sub)
  req.user = user
  next()
}
```

### After:
```javascript
import { User } from "../models/User.js"
import { getDatabase } from "../db/mongodb.js"

const authMiddleware = async (req, res, next) => {
  // ... token verification ...
  const db = await getDatabase()
  const user = await User.findById(db, payload.sub)
  
  req.user = {
    ...user,
    id: user._id.toString(),
  }
  next()
}
```

## Testing
✅ Backend server starts successfully with MongoDB connection
✅ Profile authentication middleware properly validates JWT cookies
✅ User lookup works correctly with MongoDB
✅ Profile controllers receive properly formatted user data

## Next Steps
1. Test profile picture upload from frontend (both freelancer and client)
2. Test profile data saving from frontend
3. Verify profile data persistence in MongoDB collections:
   - `freelancerProfiles`
   - `clientProfiles`

## Related Files
- `backend/src/routes/profile.routes.js` - Authentication middleware (fixed)
- `backend/src/controllers/profile.controller.js` - Profile operations (already MongoDB-compatible)
- `backend/src/models/User.js` - User model with MongoDB queries
- `frontend/src/pages/Dashboard/ProfileSettings.jsx` - Profile UI component

## Additional Fix: Profile Image Persistence

### Issue
Profile images were uploading successfully but not persisting after page refresh or logout/login.

### Root Cause
The profile image path was stored in MongoDB as a relative path (e.g., `/uploads/1762758339569.png`), but when loading the profile data, the frontend was not prepending the backend URL to create the full image URL.

### Solution
Updated `ProfileSettings.jsx` to handle image paths correctly:

```javascript
// Before:
setProfileImage(data.profile?.profile_image || data.user.avatar || '');

// After:
const imagePath = data.profile?.profile_image || data.user.avatar || '';
if (imagePath) {
  // If path already has http, use it as is, otherwise prepend backend URL
  setProfileImage(imagePath.startsWith('http') ? imagePath : `http://localhost:4000${imagePath}`);
} else {
  setProfileImage('');
}
```

This ensures:
- Relative paths get the backend URL prepended
- Absolute URLs (already containing http) are used as-is
- Empty paths result in empty profile image state

## Branch
- Branch: `fix/profile-authentication`
- Commits: 
  - `f7d29e7` - Fix: Profile authentication error - Add MongoDB database connection to authMiddleware
  - `2983ad1` - Fix: Profile image not persisting after refresh/logout
