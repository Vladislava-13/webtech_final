import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/axios";

export default function ApiKeyPage() {
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await api.get("/api/users/api-key");
        setApiKey(res.data.apiKey);
      } catch (err) {
        setError("failed_to_fetch_api_key");
      }
    };
    fetchKey();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("failed_to_copy");
    }
  };

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl p-4 sm:p-6 bg-gray-700 rounded-xl shadow-lg text-white mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">{t("api-key-page.your-api-key")}</h2>

      <p className="text-center text-gray-400 text-sm sm:text-base">{t("api-key-page.click-to-copy")}</p>

      {apiKey ? (
        <div className="bg-gray-900 p-4 rounded-lg">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center w-full text-blue-400 hover:text-blue-200 transition text-sm sm:text-base truncate"
            title="Copy API key"
          >
            <span className="truncate">{apiKey}</span>
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm sm:text-base">{t("loading")}</p>
      )}

      {error && <div className="text-red-400 mb-4 text-sm sm:text-base text-center">{t(error)}</div>}

      {copied && (
        <p className="mt-2 text-green-400 text-center text-sm sm:text-base">{t("api-key-page.copied")}</p>
      )}
    </div>
  );
}
