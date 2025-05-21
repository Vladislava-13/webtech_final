import express from 'express';
import cors from 'cors';
import path from 'path'; // Add this for handling file paths
import sequelize from './config/db.js';
import users from './routes/users.js';
import tests from './routes/tests.js';
import history from './routes/history.js';
import exportRouter from './routes/export.js';
import User from './models/users.js';
import { setupAssociations } from './models/associations.js';
import bcrypt from 'bcrypt';
import { apiReference } from '@scalar/express-api-reference';
import { runImport } from './scripts/importQuestions.js'

const app = express();
const port = 3000;

// Define __dirname for ES modules
const currentDir = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(currentDir, '..',);

// Set up model associations
setupAssociations();

// Define app middlewares
app.use(express.json());
app.use(cors());

// Serve API documentation static files
app.use('/docs', express.static(path.join(rootDir, 'public')));
// Serve static files from the React app's build folder
app.use(express.static(path.join(rootDir, 'build'))); // Adjust path if build folder is elsewhere, e.g., 'public/build'


// Serve API reference
app.use(
  '/reference',
  apiReference({
    theme: 'laserwave',
    url: '/app/docs/openapi.json',
  })
);

// API routes
app.use('/api/users', users);
app.use('/api/tests', tests);
app.use('/api/history', history);
app.use('/api/export', exportRouter);

// Root route
app.get('/api', (req, res) => {
  res.send('Server is running');
});

// Catch-all route to serve React app for client-side routing
app.get(/^\/(?!api|docs|reference).*/, (req, res) => {
  res.sendFile(path.join(rootDir, 'build', 'index.html'));
});

// Database sync and admin user setup
sequelize.sync({ force: false }).then(async () => {
  const adminEmail = 'admin@example.com';
  const testEmail = 'test@example.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  const existingTest = await User.findOne({ where: { email: testEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: adminEmail,
      password: hashedPassword,
      is_admin: true,
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️ Admin user already exists');
  }
  if (!existingTest) {
    const hashedPassword = await bcrypt.hash('test123', 10);
    await User.create({
      email: testEmail,
      password: hashedPassword
    });
    console.log('✅ Test user created');
  } else {
    console.log('ℹ️ Test user already exists');
  }

  await runImport(path.join(rootDir, 'src', 'scripts', 'data', 'questions.json'));
  console.log('✅ Questions migrated');
}).then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}).catch((err) => {
  console.error('❌ Failed to sync database:', err);
});
