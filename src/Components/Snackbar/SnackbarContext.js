import React, { createContext, useState, useContext } from "react";
import Snackbar from "./Snackbar"; // Подключаем компонент Snackbar
import "./Snackbar.css";

// Создаём контекст
const SnackbarContext = createContext();

// Провайдер контекста
export const SnackbarProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  // Функция для добавления уведомления
  const addSnackbar = (description, type = "info", duration = 3000) => {
    const newMessage = {
      id: Date.now(), // Уникальный ID
      description,
      type,
      duration,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Функция для удаления уведомления
  const removeSnackbar = (id) => {
    setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ addSnackbar }}>
      {children}
      <div className="snackbar-container">
        {messages.map((message) => (
          <Snackbar
            key={message.id}
            id={message.id}
            description={message.description}
            type={message.type}
            duration={message.duration}
            onClose={removeSnackbar}
          />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

// Хук для использования контекста
export const useSnackbar = () => useContext(SnackbarContext);