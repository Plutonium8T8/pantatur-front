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
    const [taskDate, setTaskDate] = useState("");

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
                setTickets(data[0]);
            } else {
                console.warn("Неожиданная структура данных тикетов:", data);
            }
        } catch (error) {
            console.error("Ошибка при загрузке тикетов:", error.message);
        }
    };

    const fetchTasks = async () => {
        try {
            console.log(`Запрос к API: https://pandatur-api.com/task/user/${userId}`);

            const token = Cookies.get("jwt"); // Получаем токен авторизации
            if (!token) throw new Error("Отсутствует токен авторизации");

            const response = await fetch(`https://pandatur-api.com/task/user/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`, // Добавляем заголовок авторизации
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка при загрузке задач. Код: ${response.status}`);
            }

            const data = await response.json();
            console.log("tasks", data);
            setTasks(data); // Обновляем состояние задач
        } catch (error) {
            console.error("Ошибка при загрузке задач:", error.message);
        }
    };

    useEffect(() => {
        fetchTicketsID();
        fetchNotifications();
        fetchTasks();
    }, []);

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

    const handleTaskSubmit = async (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        try {
            if (!ticketId) throw new Error("Выберите тикет для создания задачи");
            const token = Cookies.get("jwt");
            if (!token) throw new Error("Отсутствует токен авторизации");

            const response = await fetch("https://pandatur-api.com/task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ticket_id: ticketId, // Отправляем выбранный ticket_id
                    time: taskDate, // Дата выполнения задачи
                    tag: JSON.stringify(["Example tag"]), // Преобразуем массив в строку JSON
                    description: taskContent, // Описание задачи
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при создании задачи. Код: ${response.status}`);
            }

            const data = await response.json();
            console.log("Задача успешно создана:", data);

            // Обновляем список задач
            fetchTasks();

            // Сбрасываем состояние формы
            setTaskContent("");
            setTaskDate("");
        } catch (error) {
            console.error("Ошибка при создании задачи:", error.message);
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
                        <select
                            value={ticketId || ""}
                            onChange={(e) => setTicketId(e.target.value)} // Устанавливаем ticketId при выборе
                            required
                        >
                            <option value="" disabled>
                                {tickets.length === 0 ? "Loading tickets..." : "Choose ticket ID"}
                            </option>
                            {tickets.map((ticket) => (
                                <option key={ticket.id} value={ticket.id}>
                                    {ticket.id}
                                </option>
                            ))}
                        </select>

                        <input
                            type="datetime-local"
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                            required
                        />

                        <textarea
                            value={taskContent}
                            onChange={(e) => setTaskContent(e.target.value)}
                            placeholder="Descriptions for tasks"
                            required
                            rows="10"
                            cols="30"
                        />

                        <button type="submit">Add Task</button>
                    </form>
                </div>

                <div className="left-side">
                    <h2>Add Notifications</h2>
                    <form onSubmit={handleNotificationSubmit}>
                        <input
                            type="datetime-local"
                            value={notificationDate}
                            onChange={(e) => setNotificationDate(e.target.value)}
                            required
                        />
                        <textarea
                            value={notificationContent}
                            onChange={(e) => setNotificationContent(e.target.value)}
                            placeholder="Description for notification"
                            required
                            rows="10" cols="30"
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
                            <li key={task.id}>
                                <div><strong>ID:</strong> {task.id}</div>
                                <div><strong>Ticket ID:</strong> {task.ticket_id}</div>
                                <div><strong>Scheduled Time:</strong> {task.scheduledTime}</div>
                                <div><strong>Tag:</strong> {JSON.parse(task.tag).join(", ")}</div>
                                <div><strong>Description:</strong> {task.description}</div>
                            </li>
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