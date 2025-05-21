import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from 'react-router';
import { useUser } from '../contexts/UserContext';
import api from "../services/axios";

export default function SignIn() {
  const [formData, setFormData] = useState({
    "email": "",
    "password": ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate("/test");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/users/sign-in', formData);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      navigate("/test");
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
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">{t("auth.login")}</h2>
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
        >
          {t("sign-in")}
        </button>
      </form>

      {error && <div className="mt-4 text-red-400 text-sm sm:text-base text-center">{t(error)}</div>}
      <p className="mt-6 text-center text-sm sm:text-base">
        {t("auth.dont-have")}
        <Link to="/sign-up" className="text-blue-600 hover:underline">{t("sign-up")}</Link>
      </p>
    </div>
  );
}
