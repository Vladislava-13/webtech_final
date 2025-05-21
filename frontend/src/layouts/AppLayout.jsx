import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useUser } from '../contexts/UserContext';
import { useTranslation } from "react-i18next";

export default function AppLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { t, i18n } = useTranslation();

  const handleLangChange = (e) => {
    const lang = e.target.value;
    localStorage.setItem("i18nextLng", lang);
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const lang = localStorage.getItem("i18nextLng") || "en";
    i18n.changeLanguage(lang);
    setLanguage(lang);
    const privatePaths = ["/api-key"];
    const isPrivatePage = privatePaths.includes(location.pathname);

    if (!user && isPrivatePage) {
      navigate("/sign-in");
    }
    setIsLoggedIn(!!user);
    if (user && user.isAdmin) {
      setIsAdmin(true);
    }
  }, [location, user, navigate, i18n]);

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <>
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="text-lg sm:text-xl font-bold">{t("app-name")}</div>
          <button
            className="sm:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div className={`sm:flex sm:space-x-4 ${isMenuOpen ? 'flex flex-col space-y-2 mt-2' : 'hidden sm:flex'}`}>
            {isAdmin && <NavLink to="/history" className="text-sm sm:text-base hover:text-gray-300" end>{t("history")}</NavLink>}
            <NavLink to="/test" className="text-sm sm:text-base hover:text-gray-300" end>{t("test.test")}</NavLink>
            <NavLink to="/instructions" className="text-sm sm:text-base hover:text-gray-300" end>{t("instructions.instructions")}</NavLink>
            <a href={`./reference`} target="_blank" className="text-sm sm:text-base hover:text-gray-300">API Docs</a>
            {!isLoggedIn ? (
              <>
                <NavLink to="/sign-in" className="text-sm sm:text-base hover:text-gray-300" end>{t("sign-in")}</NavLink>
                <NavLink to="/sign-up" className="text-sm sm:text-base hover:text-gray-300" end>{t("sign-up")}</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/api-key" className="text-sm sm:text-base hover:text-gray-300" end>{t("api-key")}</NavLink>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-600 text-sm sm:text-base">
                  {t("logout")}
                </button>
              </>
            )}
            <select onChange={handleLangChange} value={language} className="bg-gray-800 text-white rounded text-sm sm:text-base">
              <option value="sk">{t("slovak")}</option>
              <option value="en">{t("english")}</option>
            </select>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:p-6 flex-grow">
        <div className="w-full sm:w-3/4 mx-auto flex flex-col items-center">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 text-sm sm:text-base">
        <p>© 2025</p>
      </footer>
    </>
  );
}
