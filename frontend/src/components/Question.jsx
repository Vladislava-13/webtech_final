import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MathRenderer from './MathRenderer';

export default function Question({ question, onSubmitAnswer }) {
  const { t, i18n } = useTranslation();
  const [selectedSingle, setSelectedSingle] = useState(null);
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [openAnswer, setOpenAnswer] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!question) {
    return <div className="p-4 text-red-600 text-sm sm:text-base">{t("test.noQuestion")}</div>;
  }

  const language = i18n.language;
  const questionText = language === 'en' ? question.question_en : question.question_sk;
  const options = language === 'en' ? question.options_en : question.options_sk;
  const areas = language === 'en' ? question.areas_en : question.areas_sk;

  const handleSingleChange = (index) => {
    setSelectedSingle(index);
  };

  const handleMultipleChange = (index) => {
    setSelectedMultiple((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = () => {
    console.log('Submitting answer...');
    console.log('Time spent (seconds):', secondsElapsed);
    console.log('Selected answer(s):', {
      single: selectedSingle,
      multiple: selectedMultiple,
      open: openAnswer,
    });
    let answer;
    if (selectedSingle !== null) answer = selectedSingle;
    else if (selectedMultiple.length > 0) answer = selectedMultiple;
    else answer = openAnswer;
    setSelectedSingle(null);
    setSelectedMultiple([]);
    setOpenAnswer("");
    onSubmitAnswer({ answer, time: secondsElapsed });
    setSecondsElapsed(0);
  };

  let isAnswerSelected = false;
  if (question.type === 'single') {
    isAnswerSelected = selectedSingle !== null;
  } else if (question.type === 'multiple') {
    isAnswerSelected = selectedMultiple.length > 0;
  } else if (question.type === 'open') {
    isAnswerSelected = openAnswer.trim().length > 0;
  }

  return (
    <div className="p-4 max-w-full sm:max-w-xl mx-auto space-y-4">
      <p className="text-sm text-gray-500 mb-2">{areas.map((area) => area.charAt(0).toUpperCase() + area.slice(1)).join(", ")}</p>
      <h3 className="text-lg sm:text-xl font-bold mb-4"><MathRenderer text={questionText} /></h3>
      <p className="text-sm text-gray-500">
        {t("test.timeSpent")} {secondsElapsed} {t("test.seconds")}
      </p>

      {question.type === 'open' ? (
        <>
          <p className="text-sm text-gray-500">{t("test.openHint")}</p>
          <input
            type="text"
            value={openAnswer}
            onChange={(e) => setOpenAnswer(e.target.value)}
            className="w-full border p-2 sm:p-3 rounded text-sm sm:text-base"
            placeholder={t("test.placeholderOpen")}
          />
        </>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {options.map((option, index) => (
            <li key={index} className="flex items-center gap-2">
              <label htmlFor={`option-${index}`} className="flex items-center gap-2">
                <input
                  type={question.type === 'single' ? 'radio' : 'checkbox'}
                  name={`index`}
                  id={`option-${index}`}
                  value={index}
                  checked={
                    question.type === 'single'
                      ? selectedSingle === index
                      : selectedMultiple.includes(index)
                  }
                  onChange={() =>
                    question.type === 'single'
                      ? handleSingleChange(index)
                      : handleMultipleChange(index)
                  }
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <MathRenderer text={option} isInline={true} />
              </label>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isAnswerSelected}
        className={`mt-4 px-4 py-2 sm:py-3 rounded text-white text-sm sm:text-base ${isAnswerSelected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {t("test.next")}
      </button>
    </div>
  );
}
