import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from "../services/axios";
import MathRenderer from '../components/MathRenderer';
import { useNavigate } from 'react-router';
import { downloadCsv } from '../utils/export-csv';

export default function History() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [historyType, setHistoryType] = useState("questions");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/history/${historyType}?page=${currentPage}&limit=${itemsPerPage}`);
        setData(response.data.results || []);
        setPaginationInfo(response.data.pagination || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      }
    };
    fetchData();
  }, [historyType, currentPage]);

  const handleHistoryTypeChange = (e) => {
    setHistoryType(e.target.value);
    setCurrentPage(1);
    setData([]);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= paginationInfo?.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <select
          value={historyType}
          onChange={handleHistoryTypeChange}
          className="mb-2 sm:mb-0 p-2 bg-gray-800 text-white rounded text-sm sm:text-base"
        >
          <option value="questions">{t("questions")}</option>
          <option value="tests">{t("tests")}</option>
        </select>
        <button
          onClick={() => downloadCsv(`/api/export/${historyType}-history`, `${historyType}-history`)}
          disabled={data.length === 0}
          className={`px-4 py-2 bg-gray-700 text-white rounded text-sm sm:text-base ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
        >
          {t("export_csv")}
        </button>
        <button
          onClick={async () => {
            if (window.confirm(t("confirm_delete"))) {
              try {
                await api.delete("/api/history/clear");
                alert(t("delete_history_success"));
                window.location.reload();
              } catch (err) {
                console.error(err);
                alert(t("delete_history_fail"));
              }
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm sm:text-base"
        >
          {t("clear_history")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-700 text-white">
              {historyType === 'questions' ? (
                <>
                  <th className="border border-gray-600 p-2">{t("question")}</th>
                  <th className="border border-gray-600 p-2">{t("areas")}</th>
                  <th className="border border-gray-600 p-2">{t("successRate")}</th>
                  <th className="border border-gray-600 p-2">{t("averageTimeTaken")}</th>
                </>
              ) : (
                <>
                  <th className="border border-gray-600 p-2">{t("testDate")}</th>
                  <th className="border border-gray-600 p-2">{t("location")}</th>
                  <th className="border border-gray-600 p-2">{t("successRate")}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => {
                if (historyType === "questions") {
                  const questionText = JSON.parse(item.question)[i18n.language];
                  const areas = JSON.parse(JSON.parse(item.areas)[i18n.language]).join(", ");
                  return (
                    <tr key={item.questionId} className="bg-gray-800 text-white">
                      <td className="border border-gray-600 p-2">
                        <MathRenderer text={questionText} />
                      </td>
                      <td className="border border-gray-600 p-2">{areas}</td>
                      <td className="border border-gray-600 p-2">{item.successRate.toFixed(0)}%</td>
                      <td className="border border-gray-600 p-2">{(item.averageTimeTaken / 1000).toFixed(2)} {t("test.seconds")}</td>
                    </tr>
                  );
                } else {
                  return (
                    <tr
                      key={item.id}
                      className="bg-gray-800 text-white cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => navigate(`/tests/${item.id}`)}
                    >
                      <td className="border border-gray-600 p-2">{new Date(item.test_date).toLocaleString()}</td>
                      <td className="border border-gray-600 p-2">{item.location}</td>
                      <td className="border border-gray-600 p-2">{item.successRate.toFixed(0)}%</td>
                    </tr>
                  );
                }
              })
            ) : (
              <tr>
                <td colSpan={historyType === "questions" ? 4 : 3} className="text-center p-4 text-gray-400">
                  {t("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginationInfo && paginationInfo.totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-700 text-white rounded text-sm sm:text-base ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
          >
            {t("previous")}
          </button>
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 text-sm sm:text-base"
              >
                {currentPage - 1}
              </button>
            )}
            <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm sm:text-base">
              {currentPage}
            </button>
            {currentPage < paginationInfo.totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 text-sm sm:text-base"
              >
                {currentPage + 1}
              </button>
            )}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === paginationInfo.totalPages}
            className={`px-4 py-2 bg-gray-700 text-white rounded text-sm sm:text-base ${currentPage === paginationInfo.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
