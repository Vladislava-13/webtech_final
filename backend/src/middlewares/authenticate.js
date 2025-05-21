import { getUserByApiKey } from '../services/users.js';
import { ALLOWED_ORIGINS } from './consts.js';


export async function authenticate(req, res, next) {
  try {
    const origin = req.get("origin");
    const apiKey = req.query["api-key"];

    const isFromSameOrigin = !origin;
    const isOriginAllowed = origin && ALLOWED_ORIGINS.includes(origin);

    if (isFromSameOrigin || isOriginAllowed) {
      return next();
    }

    // If api-key is present, try to get the user
    if (apiKey) {
      const user = await getUserByApiKey(apiKey);
      if (user) {
        req.user = user; // Optional: Attach user to request
        return next();
      }
    }

    // Neither origin nor valid API key provided
    return res.status(403).json({ message: "Forbidden: Invalid origin or API key" });
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: " + error.message });
  }
}
