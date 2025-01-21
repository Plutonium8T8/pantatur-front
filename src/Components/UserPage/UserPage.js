import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../UserContext";
import "./UserProfile.css";
import { FaUser } from "react-icons/fa";

const UserPage = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [userContent, setUserContent] = useState("");
  const [userDate, setUserDate] = useState("");
  const { userId } = useUser();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Получение списка уведомлений
  const fetchUsers = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await fetch(`https://pandatur-api.com/user/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error(`Ошибка: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error("Ошибка загрузки уведомлений:", error.message);
    }
  };

  // Создание нового уведомления (POST)
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("jwt");
      const response = await fetch("https://pandatur-api.com/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          time: userDate,
          description: userContent,
          client_id: userId,
          status: false, // Новое уведомление создаётся как "непрочитанное"
        }),
      });
      if (response.ok) {
        fetchUsers(); // Обновляем список уведомлений
        setUserContent(""); // Очищаем поля формы
        setUserDate("");
      } else {
        console.error(`Ошибка создания уведомления: ${response.status}`);
      }
    } catch (error) {
      console.error("Ошибка создания уведомления:", error.message);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="userSlideInModal">
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="modal-header">
            <h2>
              <FaUser /> Users
            </h2>
          </header>
          {error && <div className="error-message">{error}</div>}

          <form className="user-form" onSubmit={handleUserSubmit}>
            <div className="input-group">
              <label>Date and Time</label>
              <input
                type="datetime-local"
                value={userDate}
                onChange={(e) => setUserDate(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                value={userContent}
                onChange={(e) => setUserContent(e.target.value)}
                placeholder="Enter user description"
                rows="4"
                required
                className="data-time-notifi"
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
