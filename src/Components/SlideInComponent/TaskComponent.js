import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../UserContext";
import "./SlideInModal.css";
import { translations } from "../utils/translations";

const TaskModal = ({ isOpen, onClose }) => {
    const [tasks, setTasks] = useState([]);
    const [taskContent, setTaskContent] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [tickets, setTickets] = useState([]);
    const [ticketId, setTicketId] = useState(null);
    const { userId } = useUser();
    const [error, setError] = useState(null);
    const [ticketIds, setTicketIds] = useState([]);

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


    const fetchTicketsID = async () => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch("https://pandatur-api.com/tickets", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTicketIds(data.map((ticket) => ticket.client_id)); // Сохраняем client_id
                console.log("Client IDs:", data.map((ticket) => ticket.client_id));
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
            const response = await fetch(`https://pandatur-api.com/task/user/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
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
            const response = await fetch("https://pandatur-api.com/task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ticket_id: ticketId,
                    time: taskDate,
                    description: taskContent,
                    tags: [""],
                }),
            });
            if (response.ok) {
                fetchTasks();
                setTaskContent("");
                setTaskDate("");
            }
        } catch (error) {
            console.error("Error creating task:", error.message);
        }
    };

    const handleClearAllTasks = async () => {
        try {
            const token = Cookies.get("jwt");
            const response = await fetch(`https://pandatur-api.com/task/clear`, {
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
            const response = await fetch("https://pandatur-api.com/task", {
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

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{translations['Taskuri'][language]}</h2>
                </header>
                {error && <div className="error-message">{error}</div>}

                <form className="notification-form" onSubmit={handleTaskSubmit}>
                    <div className="input-group">
                        <label htmlFor="ticket-select">{translations['Lead'][language]} ID</label>
                        <select
                            id="ticket-select"
                            className="task-select"
                            value={ticketId || ""}
                            onChange={(e) => setTicketId(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                {ticketIds.length === 0 ? translations['Încărcăm leadurile'][language] : translations['Alege ID lead'][language]}
                            </option>
                            {ticketIds.map((id, index) => (
                                <option key={index} value={id}>
                                    {id}
                                </option>
                            ))}
                        </select>
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
                        tasks.map((task) => (
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
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default TaskModal;
