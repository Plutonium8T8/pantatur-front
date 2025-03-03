import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { api } from "./api";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem("user_id");
    return savedUserId ? Number(savedUserId) : null;
  });

  const [name, setName] = useState(
    () => localStorage.getItem("user_name") || null
  );
  const [surname, setSurname] = useState(
    () => localStorage.getItem("user_surname") || null
  );
  const [userRoles, setUserRoles] = useState(() => {
    const savedRoles = localStorage.getItem("user_roles");
    return savedRoles ? JSON.parse(savedRoles) : [];
  });

  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    if (userId) {
      localStorage.setItem("user_id", userId);
      fetchRoles();
    } else {
      localStorage.removeItem("user_id");
      setUserRoles([]);
      setIsLoadingRoles(false);
    }
  }, [userId]);

  useEffect(() => {
    if (name) {
      localStorage.setItem("user_name", name);
    } else {
      localStorage.removeItem("user_name");
    }
  }, [name]);

  useEffect(() => {
    if (surname) {
      localStorage.setItem("user_surname", surname);
    } else {
      localStorage.removeItem("user_surname");
    }
  }, [surname]);

  useEffect(() => {
    if (userRoles.length > 0) {
      localStorage.setItem("user_roles", JSON.stringify(userRoles));
    } else {
      localStorage.removeItem("user_roles");
    }
  }, [userRoles]);

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const token = Cookies.get("jwt");
      if (!token || !userId) {
        setUserRoles([]);
        setIsLoadingRoles(false);
        return;
      }

      const data = await api.users.getById(userId);

      const parsedRoles = JSON.parse(data.roles);
      setUserRoles(data.roles);
      localStorage.setItem("user_roles", JSON.stringify(parsedRoles));
    } catch (error) {
      console.error("❌ Ошибка при загрузке ролей:", error.message);
      setUserRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const hasRole = (role) => userRoles.includes(role);

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        name,
        setName,
        surname,
        setSurname,
        userRoles,
        setUserRoles,
        hasRole,
        isLoadingRoles
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
