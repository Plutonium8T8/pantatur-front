import React, { createContext, useContext, useState } from 'react';

// Создаем контекст для хранения user_id
const UserContext = createContext();

// Провайдер для контекста
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Хук для удобного использования контекста
export const useUser = () => useContext(UserContext);
