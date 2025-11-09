import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_super_secret_change_me";

export function signJwt(payload, expiresIn = "7d") {
  // 👇 Include sub for standard compatibility, but also keep id
  return jwt.sign({ sub: payload.id, ...payload }, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export const authCookieName = "aid";

export const authCookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// ✅ Middleware to protect routes
export function ensureAuth(req, res, next) {
  try {
    console.log("🔐 ensureAuth - Checking authentication...");
    console.log("🍪 Cookies received:", req.cookies);
    console.log("🔑 Looking for cookie:", authCookieName);
    
    const token =
      req.cookies?.[authCookieName] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    console.log("🎫 Token found:", token ? "Yes" : "No");

    if (!token) return res.status(401).json({ message: "Unauthorized - No token" });

    const decoded = verifyJwt(token);
    console.log("✅ Token decoded:", decoded);
    
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

    req.user = decoded; // decoded contains id and sub
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
}
