// models/questionsHistory.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const QuestionsHistory = sequelize.define('QuestionsHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  test_history_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tests_history',
      key: 'id'
    }
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  time_taken: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  user_answer: {
    type: DataTypes.JSON,    // <-- This will store any JSON data: string, number, array, etc.
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'questions_history',
  indexes: [
    { fields: ['question_id'] },
    { fields: ['test_history_id'] }
  ]
});

export default QuestionsHistory;
