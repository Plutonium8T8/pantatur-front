import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "./UserContext";
import "./TaskComponent.css";

const TaskModal = ({ isOpen, onClose }) => {
    const [tasks, setTasks] = useState([]);
    const [taskContent, setTaskContent] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [tickets, setTickets] = useState([]);
    const [ticketId, setTicketId] = useState(null);
    const { userId } = useUser();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchTicketsID();
            fetchTasks();
        }
    }, [isOpen]);

    const fetchTicketsID = async () => {
        try {
            const token = Cookies.get("jwt");
            if (!token) return;
            const response = await fetch("https://pandatur-api.com/api/tickets", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setTickets(data[0] || []);
            }
        } catch (error) {
            console.error("Ошибка загрузки тикетов:", error.message);
        }
    };

    const fetchTasks = async () => {
        try {
            const token = Cookies.get("jwt");
            if (!token) throw new Error("Отсутствует токен авторизации");
            const response = await fetch(`https://pandatur-api.com/task/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Ошибка загрузки задач:", error.message);
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
                    tag: JSON.stringify(["Example tag"]),
                }),
            });
            if (response.ok) {
                fetchTasks();
                setTaskContent("");
                setTaskDate("");
            }
        } catch (error) {
            console.error("Ошибка создания задачи:", error.message);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay-notifi" onClick={onClose}>
            <div className="modal-content-notifi" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2 className="task-header">Tasks</h2>
                {error && <div className="error-message">{error}</div>}
                <form className="task-form" onSubmit={handleTaskSubmit}>
                    <select
                        className="task-select"
                        value={ticketId || ""}
                        onChange={(e) => setTicketId(e.target.value)}
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
                        className="task-input"
                        value={taskDate}
                        onChange={(e) => setTaskDate(e.target.value)}
                        required
                    />
                    <textarea
                        className="task-textarea"
                        value={taskContent}
                        onChange={(e) => setTaskContent(e.target.value)}
                        placeholder="Task description"
                        rows="4"
                        required
                    />
                    <button className="task-button" type="submit">Add Task</button>
                </form>
                <ul className="task-list">
                    {tasks.map((task) => (
                        <li key={task.id} className="task-item">
                            <div><strong>ID:</strong> {task.id}</div>
                            <div><strong>Description:</strong> {task.description}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TaskModal;