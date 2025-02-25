import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../UserContext";
import "./SlideInModal.css";
import { translations } from "../utils/translations";
import { api } from "../../api"

const TaskModal = ({ isOpen, onClose, selectedTicketId }) => {
    const [tasks, setTasks] = useState([]);
    const [taskContent, setTaskContent] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [tickets, setTickets] = useState([]);
    const [ticketId, setTicketId] = useState(null);
    const { userId, setUserId, name, setName, surname, setSurname } = useUser();
    const [error, setError] = useState(null);
    const [ticketIds, setTicketIds] = useState([]);
    const [taskFor, setTaskFor] = useState("");
    const [userList, setUserList] = useState([]); // Данные пользователей
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const language = localStorage.getItem('language') || 'RO';

    useEffect(() => {
        if (isOpen && userId) {
            console.log("Modal is open. Fetching data...");
            fetchTasks();
            fetchTicketsID();
        } else {
            console.log("Modal not open or userId missing.");
        }
    }, [isOpen, userId]);

    useEffect(() => {
        if (isOpen && selectedTicketId) {
            setTicketId(selectedTicketId);
            setSearchTerm(selectedTicketId.toString()); // Теперь поле обновляется
        }
    }, [isOpen, selectedTicketId]);

    const fetchTicketsID = async () => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/api/tickets", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTicketIds(data.map((ticket) => ticket.id)); // Сохраняем ticket_id
                console.log("Ticket IDs:", data.map((ticket) => ticket.id));
            } else {
                console.error("Error fetching tickets:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error.message);
        }
    };

    const fetchTasks = async () => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandatur-api.com/api/task/user/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Origin: 'https://plutonium8t8.github.io',
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching tasks. Code: ${response.status}`);
            }

            const data = await response.json();
            setTasks(data);
            console.log("tasksssssss", data);
        } catch (error) {
            console.error("Error fetching tasks:", error.message);
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get("jwt");

            // Проверяем, есть ли нужные данные
            if (!ticketId || !taskDate || !taskContent || !taskFor) {
                console.error("❌ Ошибка: Все поля должны быть заполнены.");
                return;
            }

            const taskData = {
                ticket_id: ticketId,
                scheduled_time: taskDate,
                description: taskContent,
                tags: [""],
                created_by: userId,  // ID текущего пользователя (кто создал задачу)
                created_for: taskFor, // ID выбранного пользователя (для кого создана задача)
            };

            const response = await fetch("https://pandatur-api.com/api/task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Origin: 'https://plutonium8t8.github.io',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                console.log("✅ Задача успешно создана:", taskData);
                fetchTasks();
                setTaskContent("");
                setTaskDate("");
                setTaskFor(""); // Сброс выбранного пользователя
            } else {
                console.error(`❌ Ошибка создания задачи: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("❌ Ошибка при создании задачи:", error.message);
        }
    };

    const handleClearAllTasks = async () => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandatur-api.com/api/task/clear`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    technician_id: userId,
                }),
            });
            if (response.ok) {
                setTasks([]); // Clear tasks from state
            } else {
                console.error(`Error clearing tasks: ${response.status}`);
            }
        } catch (error) {
            console.error("Error clearing tasks:", error.message);
        }
    };

    const handleMarkAsSeenTask = async (id) => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/api/task", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: id,
                    status: true,
                }),
            });
            if (response.ok) {
                fetchTasks();
            } else {
                console.error(`Ошибка обновления статуса: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка обновления статуса:", error.message);
        }
    };

    const fetchUsers = async () => {
        
        try {
            const usersData = await api.users.technician()

            // Корректное извлечение ID, имени и фамилии
            const formattedUsers = usersData.map((user) => ({
                id: user.id.id, // ID пользователя
                name: user.id.name || "N/A", // Имя (если пусто - "N/A")
                surname: user.id.surname || "N/A", // Фамилия (если пусто - "N/A")
            }));

            console.log("✅ Пользователи загружены:", formattedUsers);
            setUserList(formattedUsers);
        } catch (error) {
            console.error("❌ Ошибка при загрузке пользователей:", error.message);
        }
    };

    // Запуск загрузки пользователей при монтировании компонента
    useEffect(() => {
        fetchUsers();
    }, [userId]);

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);
        setIsDropdownOpen(true);
        if (ticketIds.includes(Number(inputValue))) {
            setTicketId(Number(inputValue));
        }
    };

    const handleSelect = (id) => {
        setTicketId(id);
        setSearchTerm(id);
        setIsDropdownOpen(false);
    };

    const handleUserInputChange = (e) => {
        setSearchUser(e.target.value);
        setIsUserDropdownOpen(true);
    };

    const handleUserSelect = (user) => {
        setTaskFor(Number(user.id));
        setSearchUser(`${user.id} - ${user.name || 'N/A'} ${user.surname || 'N/A'}`);
        setIsUserDropdownOpen(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{translations['Taskuri'][language]}</h2>
                </header>
                {error && <div className="error-message">{error}</div>}

                <form className="notification-form" onSubmit={handleTaskSubmit}>
                    <div className="input-group" style={{ position: "relative" }}>
                        <label htmlFor="ticket-select">{translations['Lead'][language]} ID</label>
                        <input
                            id="ticket-select"
                            className="task-select-component"
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={() => setIsDropdownOpen(true)} // Открываем список при фокусе
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Закрываем список после потери фокуса
                            placeholder={translations['Alege ID lead'][language]}
                            required
                        />

                        {/* Выпадающий список */}
                        {isDropdownOpen && ticketIds.length > 0 && (
                            <ul className="dropdown-list">
                                {ticketIds
                                    .filter((id) => id.toString().includes(searchTerm))
                                    .map((id, index) => (
                                        <li key={index} onMouseDown={() => handleSelect(id)}>
                                            {id}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="task-date">{translations['Dată și oră'][language]}</label>
                        <input
                            id="task-date"
                            type="datetime-local"
                            className="task-input"
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="task-content">{translations['Descriere task'][language]}</label>
                        <textarea
                            id="task-content"
                            className="task-textarea"
                            value={taskContent}
                            onChange={(e) => setTaskContent(e.target.value)}
                            placeholder={translations['Descriere task'][language]}
                            rows="4"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="created-by">{translations['Creat de'][language]}</label>
                        <input
                            id="created-by"
                            type="text"
                            className="task-input"
                            value={`${userId} - ${name ? name : 'N/A'} ${surname ? surname : 'N/A'}`}
                            disabled
                        />
                    </div>

                    <div className="input-group" style={{ position: "relative" }}>
                        <label htmlFor="for-user">{translations['Pentru'][language]}</label>
                        <input
                            id="for-user"
                            className="task-select-component"
                            type="text"
                            value={searchUser}
                            onChange={handleUserInputChange}
                            onFocus={() => setIsUserDropdownOpen(true)} // Открываем список при фокусе
                            onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)} // Закрытие списка после потери фокуса
                            placeholder={translations['Alege utilizator'][language]}
                            required
                        />

                        {/* Выпадающий список */}
                        {isUserDropdownOpen && userList.length > 0 && (
                            <ul className="dropdown-list">
                                {userList
                                    .filter((user) =>
                                        `${user.id} ${user.name} ${user.surname}`
                                            .toLowerCase()
                                            .includes(searchUser.toLowerCase())
                                    )
                                    .map((user) => (
                                        <li key={user.id} onMouseDown={() => handleUserSelect(user)}>
                                            {`${user.id} - ${user.name || 'N/A'} ${user.surname || 'N/A'}`}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>

                    <div className="button-container">
                        <button className="submit-button" type="submit">
                            {translations['Adaugă task'][language]}
                        </button>
                        <button
                            className="clear-button"
                            type="button"
                            onClick={handleClearAllTasks}
                        >
                            {translations['Șterge toate'][language]}
                        </button>
                    </div>
                </form>

                <ul className="notification-list">
                    {tasks.length === 0 ? (
                        <li className="no-notifications">{translations['Nici un task'][language]}</li>
                    ) : (
                        tasks.map((task) => {
                            // Найти пользователя по его ID в списке userList
                            const assignedUser = userList.find(user => user.id === task.created_for);

                            return (
                                <li key={task.id} className="notification-item">
                                    <div className="notification-content">
                                        <div>
                                            <p className="description">
                                                <strong>ID:</strong> {task.id}
                                            </p>
                                            <p className="description">
                                                <strong>TASK FOR TICKET:</strong> {task.ticket_id}
                                            </p>
                                            <p className="description">
                                                <strong>{translations['Creat de'][language]}:</strong> {task.created_by}
                                            </p>
                                            <p className="description">
                                                <strong>{translations['Pentru'][language]}:</strong>
                                                {assignedUser
                                                    ? `${assignedUser.name} ${assignedUser.surname}`
                                                    : `ID: ${task.created_for}`}
                                            </p>
                                            <p className="description">
                                                <strong>{translations['Descriere'][language]}:</strong> {task.description}
                                            </p>
                                            <p className="time">{new Date(task.scheduled_time).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="action-group">
                                        <p className={`status ${task.status ? "seen" : "unseen"}`}>
                                            {task.status ? translations['Văzut'][language] : translations['Nevăzut'][language]}
                                        </p>
                                        {!task.status && (
                                            <button
                                                className="mark-as-seen"
                                                onClick={() => handleMarkAsSeenTask(task.id)}
                                            >
                                                {translations['Marchează'][language]}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );
};

export default TaskModal;
