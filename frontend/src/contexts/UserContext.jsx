import React, { createContext, useContext, useEffect, useState } from 'react';
import api from "../services/axios";
// Create the context
const UserContext = createContext(null);

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const parseJwt = (token) => {
    try {
      const base64Payload = token.split('.')[1];
      const payload = atob(base64Payload);
      return JSON.parse(payload);
    } catch (e) {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");
        await api.get("/api/users/verify-token");
        setUser(parseJwt(token));
      } catch (error) {
        logout();
      }

    }
    checkUser();
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUser = () => useContext(UserContext);
