import express from 'express';
import { getPaginatedTestHistory, getQuestionsHistoryStats, getTestWithQuestions, clearAllHistoryStatistics } from '../services/statistics.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.use(authenticate);
router.use(authenticateJWT);
router.use(isAdmin);

router.get('/questions', async (req, res) => {
  try {
    // Extract and validate pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : null; // null limit means all records

    // Call service with pagination parameters
    const response = await getQuestionsHistoryStats(page, limit);

    // Send successful response
    return res.json(response);
  } catch (error) {
    console.error('Error fetching questions history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/tests', async (req, res) => {
  try {
    // Extract and validate pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : null; // null limit means all records

    // Call service with pagination parameters
    const response = await getPaginatedTestHistory(page, limit);

    // Send successful response
    return res.json(response);
  } catch (error) {
    console.error('Error fetching questions history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/tests/:id', async (req, res) => {
  const testId = parseInt(req.params.id, 10);
  if (isNaN(testId)) {
    return res.status(400).json({ error: 'Invalid test ID' });
  }

  try {
    const testData = await getTestWithQuestions(testId);
    if (!testData) {
      return res.status(404).json({ error: 'Test history not found' });
    }
    res.json(testData);
  } catch (error) {
    console.error('Error fetching test history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.delete("/clear", async (req, res) => {
  try {
    const status = await clearAllHistoryStatistics();
    res.json(status);
  } catch (error) {
    console.error("Error deleting history:", error);
    res.status(500).json({ error: "Internal server error" })
  }
})
export default router;
