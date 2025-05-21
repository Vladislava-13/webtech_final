// middleware/isAdmin.js
export function isAdmin(req, res, next) {
  console.log(req.user);
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admins only' });
}
