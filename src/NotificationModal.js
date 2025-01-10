import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "./UserContext";
import "./NotificationModal.css";
import Icon from "./Components/Icon";
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
                setNotifications(data); // Устанавливаем уведомления в состояние
            } else {
                console.error(`Ошибка: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка загрузки уведомлений:", error.message);
        }
    };

    // Создание нового уведомления
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
                    time_scheduled: notificationDate,
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

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay-notifi" onClick={onClose}>
            <div className="modal-content-notifi" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Notifications</h2>
                {error && <div className="error-message">{error}</div>}

                {/* Форма для создания нового уведомления */}
                <form className="notification-form" onSubmit={handleNotificationSubmit}>
                    <div className="notification-input">
                        <input
                            type="datetime-local"
                            value={notificationDate}
                            onChange={(e) => setNotificationDate(e.target.value)}
                            required
                        />
                        <textarea
                            value={notificationContent}
                            onChange={(e) => setNotificationContent(e.target.value)}
                            placeholder="Notification description"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <button type="submit">Add Notification</button>
                </form>


                {/* Динамическое отображение уведомлений */}
                <ul className="notification-list">
                    {notifications.length === 0 ? (
                        <li className="no-notifications">Нет уведомлений</li>
                    ) : (
                        notifications.map((notification) => (
                            <li key={notification.id} className={`notification-item ${notification.status ? 'read' : 'unread'}`}>
                                <Icon name='notifi' />
                                {/* <div><Icon name='notifi' /></div> */}
                                <div className="notification-content">
                                    <div className="notification-description">{notification.description}</div>
                                    <div className="notification-time">{new Date(notification.scheduled_time).toLocaleString()}</div>
                                    <div className={`notification-status ${notification.status ? 'completed' : 'pending'}`}>
                                        {notification.status ? "Seen" : "Unseen"}
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