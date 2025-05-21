import { ALLOWED_ORIGINS } from "./consts.js";

export function guard(req, res, next) {
  const origin = req.get("origin");

  const isFromSameOrigin = !origin;
  const isOriginAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  if (isFromSameOrigin || isOriginAllowed) {
    return next();
  }

  if (isOriginAllowed) {
    return next();
  }

  return res.status(403).json({ message: "Forbidden: Invalid origin" })
}
