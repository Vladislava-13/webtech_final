import express from 'express';
import { Parser as Json2csvParser } from 'json2csv';
import {
  getQuestionsHistoryStats,
  getPaginatedTestHistory,
  getTestWithQuestions
} from '../services/statistics.js'; // adjust the path

import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.use(authenticate);
router.use(authenticateJWT);
router.use(isAdmin);

// Helper to convert JSON array to CSV string
function jsonToCsv(data, fields) {
  const json2csvParser = new Json2csvParser({ fields, flatten: true });
  return json2csvParser.parse(data);
}

// Route: /export/questions-history?limit=10&page=1
router.get('/questions-history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    const { results } = await getQuestionsHistoryStats(page, limit);

    // Define fields you want in CSV
    const fields = [
      'questionId',
      'question.en',
      'question.sk',
      'options.en',
      'options.sk',
      'areas.en',
      'areas.sk',
      'successRate',
      'averageTimeTaken'
    ];

    // Convert to CSV
    const csv = jsonToCsv(results, fields);

    res.header('Content-Type', 'text/csv');
    res.attachment('questions_history.csv');
    res.send(csv);

  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Route: /export/test-history?page=1&limit=10
router.get('/tests-history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { results } = await getPaginatedTestHistory(page, limit);

    const fields = ['id', 'test_date', 'location', 'successRate'];

    const csv = jsonToCsv(results, fields);

    res.header('Content-Type', 'text/csv');
    res.attachment('test_history.csv');
    res.send(csv);

  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Route: /export/test/:id
router.get('/tests/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const testData = await getTestWithQuestions(id);

    if (!testData) {
      return res.status(404).send('Test not found');
    }

    // Flatten questions for CSV export
    // Each question will be a row with test info repeated
    const rows = testData.questions.map(q => ({
      testId: testData.id,
      testDate: testData.test_date,
      question_en: q.question.en,
      question_sk: q.question.sk,
      options_en: JSON.stringify(q.options.en),
      options_sk: JSON.stringify(q.options.sk),
      areas_en: JSON.stringify(q.areas.en),
      areas_sk: JSON.stringify(q.areas.sk),
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
      correct: q.correct,
      time: q.time,
      questionHistoryId: q.id
    }));

    const fields = [
      'testId',
      'testDate',
      'question_en',
      'question_sk',
      'options_en',
      'options_sk',
      'areas_en',
      'areas_sk',
      'userAnswer',
      'correctAnswer',
      'correct',
      'time',
      'questionHistoryId'
    ];

    const csv = jsonToCsv(rows, fields);

    res.header('Content-Type', 'text/csv');
    res.attachment(`test_${id}_questions.csv`);
    res.send(csv);

  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

export default router;
