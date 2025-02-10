import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    const savedUserId = localStorage.getItem('user_id');
    return savedUserId ? Number(savedUserId) : null;
  });

  const [name, setName] = useState(() => {
    return localStorage.getItem('user_name') || null;
  });

  const [surname, setSurname] = useState(() => {
    return localStorage.getItem('user_surname') || null;
  });

  useEffect(() => {
    if (userId) {
      localStorage.setItem('user_id', userId);
    } else {
      localStorage.removeItem('user_id');
    }
  }, [userId]);

  useEffect(() => {
    if (name) {
      localStorage.setItem('user_name', name);
    } else {
      localStorage.removeItem('user_name');
    }
  }, [name]);

  useEffect(() => {
    if (surname) {
      localStorage.setItem('user_surname', surname);
    } else {
      localStorage.removeItem('user_surname');
    }
  }, [surname]);

  return (
    <UserContext.Provider value={{ userId, setUserId, name, setName, surname, setSurname }}>
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