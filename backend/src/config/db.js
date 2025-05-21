import { Sequelize } from 'sequelize';

// Initialize Sequelize with SQLite
export default new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Path to SQLite database file
});

