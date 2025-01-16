import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "./UserContext";
import "./SlideInModal.css";

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
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data || []);
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
      if (!token) throw new Error("Authorization token missing");

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
          tags: ["tag1", "tag2"],
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tasks</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form className="notification-form" onSubmit={handleTaskSubmit}>
          <div className="input-group">
            <label htmlFor="ticket-select">Ticket ID</label>
            <select
              id="ticket-select"
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
          </div>
          <div className="input-group">
            <label htmlFor="task-date">Task Date</label>
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
            <label htmlFor="task-content">Task Description</label>
            <textarea
              id="task-content"
              className="task-textarea"
              value={taskContent}
              onChange={(e) => setTaskContent(e.target.value)}
              placeholder="Task description"
              rows="4"
              required
            />
          </div>
          <button className="submit-button" type="submit">
            Add Task
          </button>
        </form>
        <ul className="notification-list">
          {tasks.map((task) => (
            <li key={task.id} className="notification-item">
              <p>
                <span className="description">
                  <strong>ID:</strong> {task.id}
                </span>
              </p>
              <p>
                <span className="description">
                  <strong>Description:</strong> {task.description}
                </span>
              </p>
              <p className="time">{new Date(task.time).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskModal;

