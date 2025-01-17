import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../UserContext";
import "./SlideInModal.css";
import { FaTimes, FaBell } from "react-icons/fa";

const NotificationModal = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationContent, setNotificationContent] = useState("");
    const [notificationDate, setNotificationDate] = useState("");
    const { userId } = useUser();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Получение списка уведомлений
    const fetchNotifications = async () => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandatur-api.com/notification/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            } else {
                console.error(`Ошибка: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка загрузки уведомлений:", error.message);
        }
    };

    // Создание нового уведомления (POST)
    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    time: notificationDate,
                    description: notificationContent,
                    client_id: userId,
                    status: false, // Новое уведомление создаётся как "непрочитанное"
                }),
            });
            if (response.ok) {
                fetchNotifications(); // Обновляем список уведомлений
                setNotificationContent(""); // Очищаем поля формы
                setNotificationDate("");
            } else {
                console.error(`Ошибка создания уведомления: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка создания уведомления:", error.message);
        }
    };

    const handleClearAllNotifications = async () => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/notification/client", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    client_id: userId,
                }),
            });
            if (response.ok) {
                setNotifications([]); // Clear the notifications from state
            } else {
                console.error(`Ошибка удаления уведомлений: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка удаления уведомлений:", error.message);
        }
    };    

    // Обновление статуса уведомления на "Seen" (PATCH)
    const handleMarkAsSeen = async (id) => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/notification", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: id,
                    status: true, // Обновляем статус на "Seen"
                }),
            });
            if (response.ok) {
                fetchNotifications(); // Обновляем список уведомлений
            } else {
                console.error(`Ошибка обновления статуса: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка обновления статуса:", error.message);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="modal-header">
                    <h2>
                        <FaBell /> Notifications
                    </h2>
                </header>
                {error && <div className="error-message">{error}</div>}

                <form className="notification-form" onSubmit={handleNotificationSubmit}>
                    <div className="input-group">
                        <label>Date and Time</label>
                        <input
                            type="datetime-local"
                            value={notificationDate}
                            onChange={(e) => setNotificationDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea
                            value={notificationContent}
                            onChange={(e) => setNotificationContent(e.target.value)}
                            placeholder="Enter notification description"
                            rows="4"
                            required
                            className="data-time-notifi"
                        ></textarea>
                    </div>
                    <div className="button-container">
                        <button className="submit-button">
                            Add Notification
                        </button>
                        <button
                            className="clear-button"
                            type="button"
                            onClick={handleClearAllNotifications}
                        >
                            Clear All
                        </button>
                    </div>

                </form>

                <ul className="notification-list">
                    {notifications.length === 0 ? (
                        <li className="no-notifications">No notifications available</li>
                    ) : (
                        notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={`notification-item ${notification.status ? "read" : "unread"
                                    }`}
                            >
                                <div className="notification-content">
                                    <div>
                                        <p className="description">{notification.description}</p>
                                        <p className="time">
                                            {new Date(notification.scheduled_time).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="action-group">
                                        <p className={`status ${notification.status ? "seen" : "unseen"}`}>
                                            {notification.status ? "Seen" : "Unseen"}
                                        </p>
                                        {!notification.status && (
                                            <button
                                                className="mark-as-seen"
                                                onClick={() => handleMarkAsSeen(notification.id)}
                                            >
                                                Mark as Seen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NotificationModal;
