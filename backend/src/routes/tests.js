import express from 'express';
import { generateTest, checkAnswers } from '../services/tests.js';
import { authenticate } from '../middlewares/authenticate.js';
import puppeteer from 'puppeteer';

const router = express.Router();
router.use(authenticate);
// POST /api/tests
router.post('/', async (req, res) => {
  try {
    const seenQuestionIds = req.body.seenQuestionIds || [];

    if (!Array.isArray(seenQuestionIds)) {
      return res.status(400).json({ error: 'seenQuestionIds must be an array of IDs.' });
    }

    const { message, questions } = await generateTest(seenQuestionIds);

    res.json({
      message,
      questions
    });
  } catch (error) {
    console.error('Error generating test:', error);
    res.status(500).json({ error: 'Failed to generate test.' });
  }
});

router.post('/check-answers', async (req, res) => {
  try {
    const userAnswers = req.body.answers;

    if (!userAnswers || typeof userAnswers !== 'object') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    const results = await checkAnswers(userAnswers, req.body.location);

    return res.json({ results });
  } catch (error) {
    console.error('Error checking answers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
router.post("/generate-pdf", async (req, res) => {
  const { fullHtml } = req.body;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(fullHtml);
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=instructions.pdf",
  });
  res.send(pdfBuffer);
});

export default router;
