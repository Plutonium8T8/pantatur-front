import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "./UserContext";
import "./NotificationComponent.css";

const NotificationComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [taskContent, setTaskContent] = useState("");
    const [notificationContent, setNotificationContent] = useState("");
    const [notificationDate, setNotificationDate] = useState("");
    const [tickets, setTickets] = useState([]);
    const [ticketId, setTicketId] = useState(null);
    const { userId } = useUser();
    const [error, setError] = useState(null);

    const fetchTicketsID = async () => {
        try {
            const token = Cookies.get("jwt");
            if (!token) {
                console.warn("Нет токена. Пропускаем загрузку тикетов.");
                return;
            }

            const response = await fetch("https://pandatur-api.com/api/tickets", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка при получении тикетов. Код статуса: ${response.status}`);
            }

            const data = await response.json();
            if (Array.isArray(data) && Array.isArray(data[0])) {
                setTickets(data[0]); // Извлекаем первый элемент, содержащий массив тикетов
            } else {
                console.warn("Неожиданная структура данных тикетов:", data);
            }
        } catch (error) {
            console.error("Ошибка при загрузке тикетов:", error.message);
        }
    };

    const fetchTasks = async (ticketId) => {
        try {
            const response = await fetch(`https://pandatur-api.com/task/${ticketId}`);
            if (!response.ok) throw new Error("Ошибка при загрузке задач");
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Ошибка при загрузке задач:", error);
        }
    };

    const handleTicketChange = (e) => {
        const selectedTicketId = e.target.value;
        setTicketId(selectedTicketId);
        fetchTasks(selectedTicketId);
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`https://pandatur-api.com/notification/${userId}`);
            if (!response.ok) throw new Error("Ошибка при загрузке уведомлений");

            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error("Ошибка при загрузке уведомлений:", error);
        }
    };

    useEffect(() => {
        fetchTicketsID();
        fetchNotifications();
    }, []);

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!ticketId) throw new Error("Необходимо выбрать тикет для создания задачи");

            const response = await fetch(`https://pandatur-api.com/task/${ticketId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: taskContent, ticketId }),
            });

            if (!response.ok) throw new Error("Ошибка при создании задачи");
            await fetchTasks(ticketId);
            setTaskContent("");
        } catch (error) {
            console.error("Ошибка при создании задачи:", error);
            setError(error.message);
        }
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/notification", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    time: notificationDate,
                    description: notificationContent,
                    client_id: userId,
                }),
            });

            if (!response.ok) throw new Error("Ошибка при создании уведомления");
            await fetchNotifications();
            setNotificationContent("");
            setNotificationDate("");
        } catch (error) {
            console.error("Ошибка при создании уведомления:", error);
            setError(error.message);
        }
    };

    return (
        <div className="notification-container">
            <h1>Notifications and Tasks</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="split-screen">
                <div className="right-side">
                    <h2>Add Tasks</h2>
                    <form onSubmit={handleTaskSubmit}>
                        <h1>Choose Ticket for Tasks</h1>
                        <select
                            value={ticketId || ""}
                            onChange={handleTicketChange}
                            style={{ color: "#000", backgroundColor: "#fff" }}
                        >
                            <option value="" disabled>
                                {tickets.length === 0 ? "Loading tickets..." : "Choose ticket"}
                            </option>
                            {tickets.map((ticket) => (
                                <option key={ticket.id} value={ticket.id}>
                                    {ticket.id}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={taskContent}
                            onChange={(e) => setTaskContent(e.target.value)}
                            placeholder="Descriptions for tasks"
                            required
                        />
                        <button type="submit">Add Task</button>
                    </form>
                </div>

                <div className="left-side">
                    <h2>Add Notifications</h2>
                    <form onSubmit={handleNotificationSubmit}>
                        <input
                            type="text"
                            value={notificationContent}
                            onChange={(e) => setNotificationContent(e.target.value)}
                            placeholder="Description for notification"
                            required
                        />
                        <input
                            type="datetime-local"
                            value={notificationDate}
                            onChange={(e) => setNotificationDate(e.target.value)}
                            required
                        />
                        <button type="submit">Add Notification</button>
                    </form>
                </div>
            </div>

            <div className="split-screen">
                <div className="left-side">
                    <h2>Tasks</h2>
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id}>{task.content}</li>
                        ))}
                    </ul>
                </div>

                <div className="right-side">
                    <h1>Notifications</h1>
                    <ul>
                        {notifications.map((notification) => (
                            <li key={notification.id}>
                                <strong>Description:</strong> {notification.description} <br />
                                <strong>Time:</strong> {notification.scheduledTime}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NotificationComponent;