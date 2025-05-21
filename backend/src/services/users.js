import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import User from '../models/users.js'; // Adjust path to your model

// Sign up a new user
export async function signup(email, password) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    return { id: user.id, email: user.email };
  } catch (error) {
    throw new Error(`Signup failed: ${error.message}`);
  }
}

// Login user
export async function login(email, password) {
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return { id: user.id, email: user.email, isAdmin: user.is_admin };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

// Generate or retrieve API key
export async function generateApiKey(userId) {
  try {
    // Find user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Return existing API key if present
    if (user.api_key) {
      return user.api_key;
    }

    // Generate new API key
    const apiKey = uuidv4();
    await user.update({ api_key: apiKey });

    return apiKey;
  } catch (error) {
    throw new Error(`API key generation failed: ${error.message}`);
  }
}
export async function getUserByApiKey(apiKey) {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const user = await User.findOne({ where: { api_key: apiKey } });

    if (!user) {
      throw new Error('Invalid API key');
    }

    return { id: user.id, email: user.email, isAdmin: user.is_admin };
  } catch (error) {
    throw new Error(`Failed to get user by API key: ${error.message}`);
  }
}

