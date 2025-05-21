import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import QuestionResult from '../components/QuestionResult';
import api from "../services/axios";
import { downloadCsv } from "../utils/export-csv";

export default function TestHistory() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/history/tests/${id}`);
        setData(res.data);
      } catch (error) {
        setError("something_went_wrong");
      }
    };
    fetchData();
  }, [id, t]);

  if (error) {
    return <div className="p-4 text-red-600 text-sm sm:text-base">{t(error)}</div>;
  }

  if (!data) {
    return <div className="p-4 text-sm sm:text-base">{t("loading")}</div>;
  }

  const lang = i18n.language.startsWith("sk") ? "sk" : "en";

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">{t("test_history")}</h1>

      <button
        onClick={() => downloadCsv(`/api/export/tests/${id}`, `test-${id}-history`)}
        disabled={data.length === 0}
        className={`px-4 py-2 sm:py-3 bg-gray-700 text-white rounded text-sm sm:text-base ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
      >
        {t("export_csv")}
      </button>
      <div className="mb-6 space-y-2">
        <div>
          <span className="font-semibold text-sm sm:text-base">{t("testDate")}: </span>
          {new Date(data.test_date).toLocaleDateString()}
        </div>
        <div>
          <span className="font-semibold text-sm sm:text-base">{t("location")}: </span>
          {data.city || data.country
            ? [data.city, data.country].filter(Boolean).join(", ")
            : t("unknown")}
        </div>
      </div>

      {data.questions.length === 0 ? (
        <p className="text-sm sm:text-base">{t("test.no_questions")}</p>
      ) : (
        <ul className="space-y-4 sm:space-y-6">
          {data.questions.map((q) => (
            <li key={q.id}>
              <QuestionResult result={q} lang={lang} t={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
