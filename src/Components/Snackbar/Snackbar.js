import React, { useState, useEffect } from "react";
import "./Snackbar.css";

const Snackbar = ({ id, description, type = "info", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose(id); // Удаляем по ID
    }, duration);

    return () => clearTimeout(timer); // Очищаем таймер при размонтировании
  }, [id, description, duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`snackbar snackbar-${type}`}>
      <span>{description}</span>
      <button
        className="snackbar-close"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose(id); // Удаляем по ID
        }}
      >
        ✕
      </button>
    </div>
  );
};

const SnackbarContainer = () => {
  const [messages, setMessages] = useState([]);

  // Добавить новое уведомление
  const showSnackbar = (description, type = "info") => {
    const newMessage = {
      id: Date.now(), // Уникальный ID
      description,
      type,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Удалить уведомление из списка
  const removeSnackbar = (id) => {
    setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
  };

  return (
    <div className="snackbar-container">
      {messages.map((message) => (
        <Snackbar
          key={message.id}
          id={message.id}
          description={message.description}
          type={message.type}
          duration={6000}
          onClose={removeSnackbar}
        />
      ))}

      {/* Кнопки для тестирования */}
      <button onClick={() => showSnackbar("Информация!", "info")}>
        Показать Info
      </button>
      <button onClick={() => showSnackbar("Успешно выполнено!", "success")}>
        Показать Success
      </button>
      <button onClick={() => showSnackbar("Произошла ошибка!", "error")}>
        Показать Error
      </button>
    </div>
  );
};

export default SnackbarContainer;