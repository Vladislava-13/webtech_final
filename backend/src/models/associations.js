// associations.js
import Question from './questions.js';
import QuestionsHistory from './questionsHistory.js';
import TestHistory from './testHistory.js';

export function setupAssociations() {
  // Question → QuestionsHistory
  Question.hasMany(QuestionsHistory, {
    foreignKey: 'question_id',
    as: 'QuestionHistories'
  });
  QuestionsHistory.belongsTo(Question, {
    foreignKey: 'question_id',
    as: 'Question'
  });

  // TestHistory → QuestionsHistory
  TestHistory.hasMany(QuestionsHistory, {
    foreignKey: 'test_history_id',
    as: 'QuestionsHistory'
  });
  QuestionsHistory.belongsTo(TestHistory, {
    foreignKey: 'test_history_id',
    as: 'TestHistory'
  });
}
