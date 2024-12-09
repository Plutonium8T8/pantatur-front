import React, { useState, useEffect } from "react";
import "./Snackbar.css"; // Стили для Snackbar

const Snackbar = ({ description, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (description) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer); // Очищаем таймер при размонтировании
    }
  }, [description, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="snackbar">
      <span>{description}</span>
      <button className="snackbar-close" onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  );
};

const SnackbarContainer = () => {
  const [description, setDescription] = useState([]);

  const showSnackbar = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const removeMessage = () => {
    setMessages((prevMessages) => prevMessages.slice(1)); // Удаляем первое сообщение из списка
  };

  return (
    <div className="snackbar-container">
      {messages.map((msg, index) => (
        <Snackbar
          key={index}
          description={msg}
          duration={3000}
          onClose={removeMessage}
        />
      ))}
      <button onClick={() => showSnackbar("Это новое сообщение!")}>Показать сообщение</button>
    </div>
  );
};

export default SnackbarContainer;