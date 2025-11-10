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

## Branch
- Branch: `fix/profile-authentication`
- Commit: `f7d29e7` - Fix: Profile authentication error - Add MongoDB database connection to authMiddleware
