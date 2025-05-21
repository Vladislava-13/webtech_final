import QuestionsHistory from '../models/questionsHistory.js';
import TestHistory from '../models/testHistory.js';
import Question from '../models/questions.js';
import { getTestWithQuestions } from './statistics.js';
import { Op, fn } from 'sequelize';


export async function generateTest(seenQuestionIds = []) {
  // Step 1: Fetch unseen questions
  const unseenQuestions = await Question.findAll({
    where: {
      id: {
        [Op.notIn]: seenQuestionIds
      }
    },
    order: [fn('RANDOM')],
    limit: 10
  });

  let questions = unseenQuestions;
  let message = null;

  // Step 2: If fewer than 10 unseen, fetch more from seen questions
  if (unseenQuestions.length < 10) {
    const remainingCount = 10 - unseenQuestions.length;

    const additionalQuestions = await Question.findAll({
      where: {
        id: {
          [Op.in]: seenQuestionIds
        }
      },
      order: [fn('RANDOM')],
      limit: remainingCount
    });

    questions = [...unseenQuestions, ...additionalQuestions];

    if (unseenQuestions.length === 0) {
      message = "all_questions_seen";
    } else {
      message = "not_enough_new_questions";
    }
  }

  return {
    message,
    questions
  };
}

export async function checkAnswers(userAnswers, metadata = {}) {
  const questionIds = Object.keys(userAnswers).map(id => parseInt(id));
  const questions = await Question.findAll({
    where: { id: questionIds }
  });

  const questionsMap = new Map(questions.map(q => [q.id, q]));
  const historyRecords = [];

  for (const qIdStr of Object.keys(userAnswers)) {
    const qId = parseInt(qIdStr);
    const question = questionsMap.get(qId);
    const userEntry = userAnswers[qIdStr] || {};
    const userAnswer = userEntry.answer;
    const timeSpent = userEntry.time * 1000;

    if (!question) continue;

    const correctAnswer = question.correct_answer;
    const type = question.type;
    let isCorrect = false;

    if (userAnswer === undefined) {
      isCorrect = false;
    } else if (type === 'single' || type === 'open') {
      isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.includes(userAnswer)
        : correctAnswer === userAnswer;
    } else if (type === 'multiple') {
      if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
        const correctSet = new Set(correctAnswer);
        const userSet = new Set(userAnswer);
        isCorrect = correctSet.size === userSet.size && [...correctSet].every(x => userSet.has(x));
      }
    }


    historyRecords.push({
      question_id: qId,
      is_correct: isCorrect,
      time_taken: timeSpent || null,
      user_answer: userAnswer
    });

  }

  // Save overall test history
  const testHistory = await TestHistory.create({
    city: metadata.city || null,
    country: metadata.country || null
  });

  // Add test_history_id to each record
  for (const record of historyRecords) {
    record.test_history_id = testHistory.id;
  }

  // Save individual question history records
  if (historyRecords.length > 0) {
    await QuestionsHistory.bulkCreate(historyRecords);
  }

  return getTestWithQuestions(testHistory.id);
}
