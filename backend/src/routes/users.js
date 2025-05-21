import express from 'express';
import * as userService from '../services/users.js'; // Adjust path to your UserService
import { authenticateJWT, JWT_SECRET } from '../middlewares/authenticateJWT.js';
import { guard } from '../middlewares/guard.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get("/verify-token", async (req, res) => {
  if (req.user) return res.status(200).json({ message: "Token is fine" });
});
router.use(guard);
// POST /sign-up - Create a new user
router.post('/sign-up', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userService.signup(email, password);
    return res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /sing-in - Authenticate a user
router.post('/sign-in', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userService.login(email, password);
    // Generate JWT
    console.log(user);
    const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: error.message });
  }
});

// GET /api-key - Generate or retrieve API key
router.get('/api-key', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user; // Get userId from JWT

    const apiKey = await userService.generateApiKey(userId);
    return res.status(200).json({ message: 'API key retrieved or generated', apiKey });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
