import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст для хранения user_id
const UserContext = createContext();

// Провайдер для контекста
export const UserProvider = ({ children }) => {
  // Чтение user_id из localStorage при инициализации состояния
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem('user_id');
    return savedUserId ? savedUserId : null;
  });

  // Запись user_id в localStorage при его изменении
  useEffect(() => {
    if (userId) {
      localStorage.setItem('user_id', userId);
    } else {
      localStorage.removeItem('user_id'); // Если userId очищается, удаляем его из localStorage
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Хук для удобного использования контекста
export const useUser = () => useContext(UserContext);