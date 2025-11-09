// backend/src/lib/requireUser.js
const { verifyJwt } = require('./jwt');
const TOKEN_COOKIE_NAME = 'token'; // change if your cookie name is different

module.exports = function requireUser(req, res, next) {
  try {
    const token = req.cookies?.[TOKEN_COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = verifyJwt(token);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
