import { useTranslation } from "react-i18next";
import MathRenderer from './MathRenderer';

export default function QuestionResult({ result }) {
  const { t, i18n } = useTranslation();
  const {
    question,
    options,
    areas,
    userAnswer,
    correctAnswer,
    correct,
    time,
    averageTimeTaken
  } = result;

  const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

  const getOptionStyle = (optionIndex) => {
    const isCorrect = correctAnswers.includes(optionIndex);
    const isUserSelected = userAnswers.includes(optionIndex);

    if (isCorrect && isUserSelected) return "bg-green-500 text-black";
    if (isCorrect) return "bg-green-200 text-black";
    if (isUserSelected) return "bg-red-300 text-black";

    return "bg-gray-100 text-black";
  };

  return (
    <div className="border border-gray-300 p-4 sm:p-6 rounded-lg shadow-sm mb-6">
      <p className="text-sm text-gray-500 mb-2">{areas[i18n.language].map((area) => area.charAt(0).toUpperCase() + area.slice(1)).join(", ")}</p>
      <h3 className="text-lg sm:text-xl font-bold mb-4"><MathRenderer text={question[i18n.language]} /></h3>
      <p className="text-sm text-gray-500">
        {t("averageTimeTaken")} {averageTimeTaken / 1000} {t("test.seconds")}
      </p>
      <p className="text-sm text-gray-500">
        {t("test.timeSpent")} {time / 1000} {t("test.seconds")}
      </p>

      {options[i18n.language] ? (
        <ul className="space-y-2 sm:space-y-3">
          {options[i18n.language].map((option, index) => (
            <li
              key={index}
              className={`p-3 rounded ${getOptionStyle(index)} text-sm sm:text-base`}
            >
              <MathRenderer text={option} isInline={true} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-gray-100 p-4 rounded text-black text-sm sm:text-base">
          <p><span className="font-medium">{t("test.your_answer")}:</span> {userAnswer}</p>
          <p><span className="font-medium">{t("test.correct_answer")}:</span> {correctAnswer}</p>
        </div>
      )}

      <div className="mt-4">
        {correct ? (
          <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm sm:text-base">✅ {t("test.correct")}</span>
        ) : (
          <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm sm:text-base">❌ {t("test.incorrect")}</span>
        )}
      </div>
    </div>
  );
}
