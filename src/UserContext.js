import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem('user_id');
    return savedUserId ? Number(savedUserId) : null; // Убедитесь, что преобразуете в число
  });

  useEffect(() => {
    if (userId) {
      localStorage.setItem('user_id', userId); // Сохранение userId
    } else {
      localStorage.removeItem('user_id'); // Удаление, если null
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};