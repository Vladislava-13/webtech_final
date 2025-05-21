import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/axios";

export default function InstructionPage() {
  const { t } = useTranslation();
  const contentRef = useRef();

  const downloadPDF = async () => {
    const contentHtml = contentRef.current.outerHTML;
    // Create a full HTML document with Tailwind CSS included
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Instructions PDF</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body class="bg-gray-700 text-white">
        ${contentHtml}
      </body>
      </html>
    `;
    try {
      const res = await api.post("/api/tests/generate-pdf", { fullHtml }, {
        headers: { "Content-Type": "application/json" },
        responseType: "blob"
      })
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "instructions.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl p-4 sm:p-6 bg-gray-700 rounded-xl shadow-lg text-white mx-auto">
      <div className="py-4" ref={contentRef}>
        <h2 className="text-lg sm:text-2xl font-bold mb-4 text-center">
          {t("instructions.title")}
        </h2>

        <p className="mb-4 text-sm sm:text-base">{t("instructions.intro")}</p>

        <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("instructions.getting_started")}</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4 text-sm sm:text-base">
          <li>{t("instructions.step1")}</li>
          <li>{t("instructions.step2")}</li>
          <li>{t("instructions.step3")}</li>
        </ol>

        <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("instructions.taking_tests")}</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4 text-sm sm:text-base">
          <li>{t("instructions.test_step1")}</li>
          <li>{t("instructions.test_step2")}</li>
          <li>{t("instructions.test_step3")}</li>
          <li>{t("instructions.test_step4")}</li>
        </ol>

        <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("instructions.understanding_results")}</h3>
        <p className="mb-4 text-sm sm:text-base">{t("instructions.results_intro")}</p>
        <ul className="list-disc list-inside space-y-2 mb-4 text-sm sm:text-base">
          <li>{t("instructions.results_areas")}</li>
          <li>{t("instructions.results_time")}</li>
          <li>{t("instructions.results_history")}</li>
        </ul>

        <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("instructions.additional_features")}</h3>
        <ul className="list-disc list-inside space-y-2 mb-4 text-sm sm:text-base">
          <li>{t("instructions.api_key")}</li>
        </ul>
      </div>

      <button
        onClick={downloadPDF}
        className="mt-6 w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded transition text-sm sm:text-base"
      >
        {t("instructions.download")}
      </button>
    </div>
  );
}
