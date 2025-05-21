import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from 'react-router';
import { useUser } from '../contexts/UserContext';
import api from "../services/axios";

export default function SignUp() {
  const [formData, setFormData] = useState({
    "email": "",
    "password": "",
    "confirmPassword": ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate("/test");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("passwords_dont_match");
      return;
    }
    try {
      const res = await api.post('/api/users/sign-up', { email: formData.email, password: formData.password });
      navigate("/sign-in");
    } catch (err) {
      if (err.response && err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        console.error(err);
        setError('something_went_wrong');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-600 rounded-2xl shadow-lg mx-auto max-w-md sm:max-w-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">{t("auth.registration")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm sm:text-base font-medium" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm sm:text-base font-medium" htmlFor="password">{t("auth.password")}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm sm:text-base font-medium" htmlFor="confirmPassword">{t("auth.confirm-password")}</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
        >
          {t("sign-up")}
        </button>
      </form>

      {error && <div className="mt-4 text-red-400 text-sm sm:text-base text-center">{t(error)}</div>}
      <p className="mt-6 text-center text-sm sm:text-base">
        {t("auth.already-have")}
        <Link to="/sign-in" className="text-blue-600 hover:underline">{t("sign-in")}</Link>
      </p>
    </div>
  );
}
