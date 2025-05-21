import TestHistory from '../models/testHistory.js';
import QuestionsHistory from '../models/questionsHistory.js';
import Question from '../models/questions.js';
import { Sequelize } from 'sequelize';

export async function getQuestionsHistoryStats(page = 1, limit = null) {
  // Calculate offset for pagination
  const offset = limit ? (page - 1) * limit : 0;

  // Fetch aggregated history records with associated question details
  const queryOptions = {
    attributes: [
      [Sequelize.col('Question.id'), 'questionId'],
      [Sequelize.literal(`JSON_OBJECT('en', Question.question_en, 'sk', Question.question_sk)`), 'question'],
      [Sequelize.literal(`JSON_OBJECT('en', Question.options_en, 'sk', Question.options_sk)`), 'options'],
      [Sequelize.literal(`JSON_OBJECT('en', COALESCE(Question.areas_en, JSON_ARRAY()), 'sk', COALESCE(Question.areas_sk, JSON_ARRAY()))`), 'areas'],
      [
        Sequelize.literal(
          `CASE 
            WHEN COUNT(*) > 0 
            THEN (SUM(CASE WHEN QuestionsHistory.is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) 
            ELSE 0 
          END`
        ),
        'successRate'
      ],
      [
        Sequelize.literal(
          `CASE 
            WHEN COUNT(*) > 0 
            THEN AVG(COALESCE(QuestionsHistory.time_taken, 0)) 
            ELSE 0 
          END`
        ),
        'averageTimeTaken'
      ]
    ],
    include: [
      {
        model: Question,
        attributes: [],
        required: true, // Inner join to ensure only questions with history are included
        as: 'Question' // Match the alias defined in the model
      }
    ],
    group: [
      'Question.id',
      'Question.question_en',
      'Question.question_sk',
      'Question.options_en',
      'Question.options_sk',
      'Question.areas_en',
      'Question.areas_sk'
    ],
    raw: true // Simplify the result to plain objects
  };

  // Add pagination if limit is specified
  if (limit) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const historyRecords = await QuestionsHistory.findAll(queryOptions);

  // Get total count for pagination metadata (when limit is specified)
  let totalRecords = historyRecords.length;
  if (limit) {
    totalRecords = await QuestionsHistory.count({
      include: [
        {
          model: Question,
          required: true,
          as: 'Question' // Match the alias
        }
      ],
      distinct: true,
      col: 'question_id' // Use the correct foreign key
    });
  }

  // Prepare response with pagination metadata
  const response = {
    results: historyRecords,
    pagination: limit ? {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      limit
    } : undefined
  };

  return response;
}
export async function getPaginatedTestHistory(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const { rows, count } = await TestHistory.findAndCountAll({
    attributes: ['id', 'test_date', 'city', 'country'],
    order: [['test_date', 'DESC']],
    offset,
    limit,
    raw: true
  });

  // Fetch related question stats for all shown test history entries
  const testIds = rows.map(row => row.id);

  const questionStats = await QuestionsHistory.findAll({
    attributes: [
      'test_history_id',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
      [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN is_correct THEN 1 ELSE 0 END')), 'correct']
    ],
    where: {
      test_history_id: testIds
    },
    group: ['test_history_id'],
    raw: true
  });

  // Map test ID to stats
  const statsMap = {};
  for (const stat of questionStats) {
    statsMap[stat.test_history_id] = {
      total: parseInt(stat.total, 10),
      correct: parseInt(stat.correct, 10)
    };
  }

  const results = rows.map(row => {
    const stats = statsMap[row.id] || { total: 0, correct: 0 };
    const successRate = stats.total > 0 ? (stats.correct * 100.0) / stats.total : 0;

    return {
      id: row.id,
      test_date: row.test_date,
      location: [row.city, row.country].filter(Boolean).join(', '),
      successRate
    };
  });

  return {
    results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalRecords: count,
      limit
    }
  };
}
export async function getTestWithQuestions(testHistoryId) {
  const test = await TestHistory.findOne({
    where: { id: testHistoryId },
    include: {
      model: QuestionsHistory,
      as: 'QuestionsHistory',
      include: {
        model: Question,
        as: 'Question'
      }
    },
    order: [
      [{ model: QuestionsHistory, as: 'QuestionsHistory' }, 'createdAt', 'DESC']
    ]
  });

  if (!test) {
    return null;
  }

  const testJson = test.toJSON();

  const questionIds = testJson.QuestionsHistory.map(qh => qh.Question.id);

  const avgTimesRaw = await QuestionsHistory.findAll({
    attributes: [
      'question_id',
      [Sequelize.fn('AVG', Sequelize.col('time_taken')), 'averageTimeTaken']
    ],
    where: {
      question_id: questionIds
    },
    group: ['question_id'],
    raw: true
  });

  const avgTimesMap = {};
  for (const record of avgTimesRaw) {
    avgTimesMap[record.question_id] = parseFloat(record.averageTimeTaken) || 0;
  }

  // Map QuestionsHistory to the enriched question result format
  const questions = testJson.QuestionsHistory.map((qh) => {
    const question = qh.Question;

    // Compose the enriched question object like checkAnswers
    return {
      question: { en: question.question_en, sk: question.question_sk },
      options: { en: question.options_en, sk: question.options_sk },
      areas: { en: question.areas_en, sk: question.areas_sk },
      userAnswer: qh.user_answer,
      correctAnswer: question.correct_answer,
      correct: qh.is_correct,
      averageTimeTaken: avgTimesMap[question.id] || 0,
      time: qh.time_taken,
      id: qh.id,
    };
  });

  const incorrectAreasCount = { en: {}, sk: {} };
  for (const question of questions) {
    if (question.correct) continue

    for (const area of question.areas["en"]) {
      incorrectAreasCount["en"][area] = (incorrectAreasCount["en"][area] || 0) + 1;
      incorrectAreasCount["sk"][area] = (incorrectAreasCount["sk"][area] || 0) + 1;

    }
  }

  return {
    ...testJson,
    QuestionsHistory: undefined, // remove raw QuestionsHistory if you want
    questions,
    incorrectAreasCount
  };
}
export async function clearAllHistoryStatistics() {
  try {
    // Delete all question history first
    await QuestionsHistory.destroy({ where: {} });

    // Then delete all test history
    await TestHistory.destroy({ where: {} });

    return { success: true, message: "All history statistics have been deleted." };
  } catch (error) {
    console.error("Error clearing history statistics:", error);
    return { success: false, message: "Failed to delete history statistics.", error };
  }
}
