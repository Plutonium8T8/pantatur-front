import React, { useState, useEffect } from "react";
import { useUser } from "../../UserContext";
import "./SlideInModal.css";
import { FaTimes, FaBell } from "react-icons/fa";
import { translations } from "../utils/translations";
import { api } from "../../api"
import { useSnackbar } from 'notistack';
import { showServerError } from "../../Components/utils/showServerError"

const NotificationModal = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationContent, setNotificationContent] = useState("");
    const [notificationDate, setNotificationDate] = useState("");
    const { userId } = useUser();
    const [error, setError] = useState(null);
    const { enqueueSnackbar } = useSnackbar()

    const language = localStorage.getItem('language') || 'RO';

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Получение списка уведомлений
    const fetchNotifications = async () => {
        try {
            const data = await api.notification.getById(userId)

            setNotifications(data);
            
        } catch (error) {
            enqueueSnackbar(showServerError(error), {variant: "error"})
            console.error("Ошибка загрузки уведомлений:", error.message);
        }
    };

    // Создание нового уведомления (POST)
    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.notification.create({
                time: notificationDate,
                description: notificationContent,
                client_id: userId,
                status: false, 
            })
         
            fetchNotifications();
            setNotificationContent("");
            setNotificationDate("");
          
        } catch (error) {
            enqueueSnackbar(showServerError(error), {variant: "error"})
            console.error("Ошибка создания уведомления:", error.message);
        }
    };

    const handleClearAllNotifications = async () => {
        try {
            await api.notification.deleteAllByUserId(userId)

            setNotifications([]);

        } catch (error) {
            enqueueSnackbar(showServerError(error), {variant: "error"})
            console.error("Ошибка удаления уведомлений:", error.message);
        }
    };    

    const handleMarkAsSeen = async (id) => {
        try {

            await api.notification.update({
                id: id,
                status: true,
            })

            fetchNotifications(); 

        } catch (error) {
            enqueueSnackbar(showServerError(error), {variant: "error"})
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
                        <FaBell /> {translations['Notificări'][language][0]}
                    </h2>
                </header>
                {error && <div className="error-message">{error}</div>}

                <form className="notification-form" onSubmit={handleNotificationSubmit}>
                    <div className="input-group">
                        <label>{translations['Dată și oră'][language]}</label>
                        <input
                            type="datetime-local"
                            value={notificationDate}
                            onChange={(e) => setNotificationDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>{translations['Descriere'][language]}</label>
                        <textarea
                            value={notificationContent}
                            onChange={(e) => setNotificationContent(e.target.value)}
                            placeholder={translations['Introduceți descrierea notificării'][language]}
                            rows="4"
                            required
                            className="data-time-notifi"
                        ></textarea>
                    </div>
                    <div className="button-container">
                        <button className="submit-button">
                            {translations['Adaugă notificare'][language]}
                        </button>
                        <button
                            className="clear-button"
                            type="button"
                            onClick={handleClearAllNotifications}
                        >
                            {translations['Șterge toate'][language]}
                        </button>
                    </div>

                </form>

                <ul className="notification-list">
                    {notifications.length === 0 ? (
                        <li className="no-notifications">{translations['Nici o notificare'][language]}</li>
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
                                            {notification.status ? translations['Văzut'][language] : translations['Nevăzut'][language]}
                                        </p>
                                        {!notification.status && (
                                            <button
                                                className="mark-as-seen"
                                                onClick={() => handleMarkAsSeen(notification.id)}
                                            >
                                                {translations['Marchează'][language]}
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
