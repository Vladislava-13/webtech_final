import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question_sk: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_en: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options_sk: {
    type: DataTypes.JSON,
    allowNull: true // For questions without options
  },
  options_en: {
    type: DataTypes.JSON,
    allowNull: true // For questions without options
  },
  areas_sk: {
    type: DataTypes.JSON,
    allowNull: false
  },
  areas_en: {
    type: DataTypes.JSON,
    allowNull: false
  },
  correct_answer: {
    type: DataTypes.JSON,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('single', 'open', 'multiple')
  }
}, {
  timestamps: true,
  tableName: 'questions',
  indexes: [
    {
      fields: ['id']
    },
    {
      fields: ['areas_sk'],
      using: 'gin' // GIN index for JSON array searching
    },
    {
      fields: ['areas_en'],
      using: 'gin'
    }
  ]
});

export default Question;
