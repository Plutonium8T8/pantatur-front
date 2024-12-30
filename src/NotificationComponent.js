import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { useUser } from "./UserContext";
import './NotificationComponent.css'; // Подключаем файл стилей

const NotificationComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [taskContent, setTaskContent] = useState(""); // Для задачи
    const [notificationContent, setNotificationContent] = useState(""); // Для уведомления
    const [notificationDate, setNotificationDate] = useState(""); // Для даты уведомления
    const [tickets, setTickets] = useState([]);
    const [ticketId, setTicketId] = useState(null);  // Храним выбранный ID тикета
    const { userId } = useUser();

    const fetchTicketsID = async () => {
        try {
            const token = Cookies.get('jwt');
            if (!token) {
                console.warn('Нет токена. Пропускаем загрузку тикетов.');
                return;
            }

            const response = await fetch('https://pandatur-api.com/api/tickets', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка при получении тикетов. Код статуса: ${response.status}`);
            }

            const data = await response.json();
            const ticketsData = data[0];  // Допустим, что тикеты находятся в первом элементе массива
            setTickets(ticketsData);  // Сохраняем тикеты в состояние
        } catch (error) {
            console.error('Ошибка при загрузке тикетов:', error.message);
        }
    };

    useEffect(() => {
        fetchTicketsID();
    }, []);

    // Функция для получения задач с сервера
    // Функция для получения задач по выбранному тикету
    const fetchTasks = async (ticketId) => {
        try {
            const response = await fetch(`https://pandatur-api.com/tasks/${ticketId}`); // Используем ticketId
            if (!response.ok) throw new Error("Ошибка при загрузке задач");
            const data = await response.json();
            setTasks(data);  // Устанавливаем задачи в состояние
        } catch (error) {
            console.error("Ошибка при загрузке задач:", error);
        }
    };
    // Обработчик изменения выбранного тикета
    const handleTicketChange = (e) => {
        const selectedTicketId = e.target.value;
        setTicketId(selectedTicketId);
        fetchTasks(selectedTicketId);  // Загружаем задачи для выбранного тикета
    };

    // Функция для получения уведомлений с сервера
    const fetchNotifications = async () => {
        try {
            const response = await fetch(`https://pandatur-api.com/notification/${userId}`); // user_Id
            if (!response.ok) throw new Error("Ошибка при загрузке уведомлений");

            const data = await response.json();

            console.log("Ответ от сервера с уведомлениями:", data); // Логируем данные ответа

            setNotifications(data); // Устанавливаем уведомления в состояние
        } catch (error) {
            console.error("Ошибка при загрузке уведомлений:", error);
        }
    };


    // Загрузка данных при монтировании компонента
    useEffect(() => {
        fetchTasks(); // Загружаем задачи
        fetchNotifications(); // Загружаем уведомления
    }, []);

    // Обработчик отправки задачи
    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: taskContent }),
            });

            if (!response.ok) throw new Error("Ошибка при создании задачи");
            await fetchTasks(); // Обновление данных после успешного создания
            setTaskContent(""); // Очистка формы задачи
        } catch (error) {
            console.error("Ошибка при создании задачи:", error);
        }
    };

    // Обработчик отправки уведомления
    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('jwt');
            const response = await fetch(`https://pandatur-api.com/notification`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    time: notificationDate, // Отправляем дату уведомления
                    description: notificationContent,
                    client_id: userId
                }),
            });

            if (!response.ok) throw new Error("Ошибка при создании уведомления");
            await fetchNotifications(); // Обновление данных после успешного создания
            setNotificationContent(""); // Очистка формы уведомления
            setNotificationDate(""); // Очистка поля даты
        } catch (error) {
            console.error("Ошибка при создании уведомления:", error);
        }
    };

    return (
        <div className="notification-container">
            <h1>Notifications and Tasks</h1>

            {/* Контейнер для разделения на две половинки */}
            <div className="split-screen">

                {/* Правая часть для создания задач */}
                <div className="right-side">
                    <h2>Add Tasks</h2>
                    <form onSubmit={handleTaskSubmit}>
                        <h1>Choise ticket for Tasks</h1>

                        {/* Селект для выбора тикета */}
                        <select value={ticketId || ''} onChange={handleTicketChange} style={{ color: "#000", backgroundColor: "#fff" }}>
                            <option value="" disabled>
                                {tickets.length === 0 ? "Loading tickets..." : "Choose ticket"}
                            </option>
                            {tickets.map((ticket) => (
                                <option key={ticket.id} value={ticket.id}>
                                    {ticket.name}
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
                        <button type="submit">Add task</button>
                    </form>
                </div>
                {/* Левая часть для создания уведомлений */}
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
                        <br />
                        {/* Поле для ввода даты уведомления */}
                        <input
                            type="datetime-local"
                            value={notificationDate}
                            onChange={(e) => setNotificationDate(e.target.value)}
                            required
                        />
                        <br />
                        <button type="submit">Add Notifications</button>
                    </form>
                </div>
            </div>

            {/* Контейнер для отображения списков задач и уведомлений */}
            <div className="split-screen">
                {/* Левая часть для задач */}
                <div className="left-side">
                    <h2>Tasks</h2>
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id}>{task.content}</li>
                        ))}
                    </ul>
                </div>

                {/* Правая часть для уведомлений */}
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