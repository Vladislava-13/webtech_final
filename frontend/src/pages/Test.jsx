import { useState, useEffect } from 'react';
import api from '../services/axios';
import Question from '../components/Question';
import QuestionResult from '../components/QuestionResult';
import { useTranslation } from 'react-i18next';

export default function Test() {
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [alreadySeenQuestions, setAlreadySeenQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [results, setResults] = useState(null);
  const { t, i18n } = useTranslation();

  async function getLocationFromBrowserIp() {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      city: data.city,
      country: data.country_name,
    };
  }

  const handleRestart = async () => {
    setAnsweredQuestions({});
    setResults(null);
    setMessage("");
    try {
      const res = await api.post("/api/tests/", { seenQuestionIds: alreadySeenQuestions });
      if (res.data.message) {
        setMessage(res.data.message);
      } else {
        setMessage("");
      }
      setQuestions(res.data.questions);
      setCurrentQuestion(res.data.questions.length > 0 ? 0 : null);
    } catch (error) {
      setMessage("something_went_wrong");
    }
  };

  const saveAlreadySeenQuestions = (questionsArray) => {
    localStorage.setItem("already_seen_questions", JSON.stringify(questionsArray));
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const seen = localStorage.getItem("already_seen_questions");
      setAlreadySeenQuestions(seen ? JSON.parse(seen) : []);
      try {
        const res = await api.post("/api/tests/", { seenQuestionIds: JSON.parse(seen) });
        if (res.data.message) {
          setMessage(res.data.message);
        } else {
          setMessage("");
        }
        setQuestions(res.data.questions);
        setCurrentQuestion(res.data.questions.length > 0 ? 0 : null);
      } catch (error) {
        setMessage("something_went_wrong");
      }
    };
    fetchQuestions();
  }, []);

  const handleSubmitAnswer = async (answer) => {
    if (currentQuestion === null || !questions[currentQuestion]) return;
    const questionId = questions[currentQuestion].id;
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: answer
    }));
    const newSeen = [...new Set([...alreadySeenQuestions, questionId])];
    setAlreadySeenQuestions(newSeen);
    saveAlreadySeenQuestions(newSeen);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      try {
        const answers = {
          ...answeredQuestions,
          [questionId]: answer
        };
        const location = await getLocationFromBrowserIp();
        const res = await api.post("/api/tests/check-answers", { answers, location });
        setResults(res.data.results);
        setMessage("test.complete");
        setCurrentQuestion(null);
        setAnsweredQuestions({});
      } catch (error) {
        console.error(error);
        setMessage("test.error");
      }
    }
  };

  const getAreas = () => {
    if (!results) return "";
    const areas = results.incorrectAreasCount[i18n.language];
    return Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`);
  };

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4 py-8">
      {message && (
        <div className="mb-6 text-center text-lg sm:text-xl font-medium">
          {t(message)}
        </div>
      )}

      {currentQuestion !== null && questions[currentQuestion] && (
        <div className="shadow-md rounded-lg p-4 sm:p-6 mb-8">
          <Question
            question={questions[currentQuestion]}
            onSubmitAnswer={handleSubmitAnswer}
          />
        </div>
      )}

      {currentQuestion === null && results && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t("test.test_summary")}</h2>
            <ul className="space-y-4">
              {results.questions.map((question) => (
                <li key={question.id} className="p-4 rounded-lg shadow">
                  <QuestionResult result={question} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">{t("test.areas_to_repeat")}</h2>
            <p className="mb-4 text-sm sm:text-base">{t("test.amount_of_errors")}</p>
            <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base">
              {getAreas().map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ol>
          </div>
          <div className="text-center mt-8">
            <button
              onClick={handleRestart}
              className="bg-blue-600 text-white px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              {t("test.restart")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
