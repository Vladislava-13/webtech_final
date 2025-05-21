import path from 'path';
import fs from 'fs';
import Question from '../models/questions.js';
import sequelize from '../config/db.js';

async function importQuestionsFromJson(jsonFilePath, batchSize = 20) {
  const rawData = fs.readFileSync(path.resolve(jsonFilePath));
  const questionsData = JSON.parse(rawData).questions;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Starting import of ${questionsData.length} questions in batches of ${batchSize}...`);

    let createdCount = 0;
    let skippedCount = 0;
    let currentBatch = [];

    for (const [index, questionData] of questionsData.entries()) {
      try {
        // Check if question exists (outside transaction for performance)
        const exists = await Question.findOne({
          where: { id: questionData.id },
          transaction
        });

        if (exists) {
          skippedCount++;
          continue;
        }

        // Prepare record
        const record = {
          id: questionData.id,
          question_sk: questionData.question_sk,
          question_en: questionData.question_en,
          areas_sk: questionData.areas_sk,
          areas_en: questionData.areas_en,
          correct_answer: questionData.correct_answer,
          type: questionData.type
        };

        if (questionData.options_sk && questionData.options_en) {
          record.options_sk = questionData.options_sk;
          record.options_en = questionData.options_en;
        }

        currentBatch.push(record);

        // Process batch when full or at the end
        if (currentBatch.length >= batchSize || index === questionsData.length - 1) {
          await Question.bulkCreate(currentBatch, { transaction });
          createdCount += currentBatch.length;
          console.log(`Processed ${index + 1}/${questionsData.length} questions...`);
          currentBatch = [];
        }
      } catch (error) {
        console.error(`Error on question ${questionData.id}:`, error.message);
      }
    }

    await transaction.commit();
    console.log(`Import successful. Created: ${createdCount}, Skipped: ${skippedCount}`);
    return { createdCount, skippedCount };
  } catch (error) {
    await transaction.rollback();
    console.error('Import failed:', error);
    throw error;
  }
}
export async function runImport(path) {
  try {
    console.log('Database connection established');

    const result = await importQuestionsFromJson(path);
    console.log('Import result:', result);
  } catch (error) {
    console.error('Import failed:', error);
  }
}

