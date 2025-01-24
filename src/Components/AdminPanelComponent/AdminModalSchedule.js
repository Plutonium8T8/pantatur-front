import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useUser } from "../../UserContext";
import "./SlideInModal.css";

const AdminModalSchedule = ({ isOpen, onClose }) => {
    const { userId } = useUser();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Schimba orar</h2>
                </header>
                {error && <div className="error-message">{error}</div>}

                <form className="notification-form" onSubmit={handleTaskSubmit}>
                    <div className="input-group">
                        <label htmlFor="ticket-select">
                            {schedule[selectedEmployee].name} ({schedule[selectedEmployee].id}),{" "}
                            {format(getWeekDays()[selectedDay], "EEEE, dd.MM")}
                            Intervalul in care angajatul este la munca.
                        </label>
                        <div className="time-inputs">
                            {intervals.map((interval, index) => (
                                <div key={index} className="time-interval">
                                    <label>
                                        Start
                                        <input
                                            type="time"
                                            value={interval.start}
                                            onChange={(e) => {
                                                const updatedIntervals = [...intervals];
                                                updatedIntervals[index].start = e.target.value;
                                                setIntervals(updatedIntervals);
                                            }}
                                        />
                                    </label>
                                    <label>
                                        End
                                        <input
                                            type="time"
                                            value={interval.end}
                                            onChange={(e) => {
                                                const updatedIntervals = [...intervals];
                                                updatedIntervals[index].end = e.target.value;
                                                setIntervals(updatedIntervals);
                                            }}
                                        />
                                    </label>
                                    <button
                                        className="delete-button"
                                        onClick={() => removeInterval(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                            <div className="add-interval">
                                <label>
                                    Start
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </label>
                                <label>
                                    End
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </label>
                                <button className="add-button-plus" onClick={AddInterval}>
                                    Adauga
                                </button>
                                <button className="add-button-minus" onClick={cutInterval}>
                                    Micșorează
                                </button>
                            </div>
                        </div>
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
                    <div className="button-container">
                        <button className="submit-button" type="submit">
                            Add Task
                        </button>
                        <button
                            className="clear-button"
                            type="button"
                            onClick={handleClearAllTasks}
                        >
                            Clear All
                        </button>
                    </div>
                </form>

                <ul className="notification-list">
                    {tasks.length === 0 ? (
                        <li className="no-notifications">No tasks available</li>
                    ) : (
                        tasks.map((task) => (
                            <li key={task.id} className="notification-item">
                                <div className="notification-content">
                                    <div>
                                        <p className="description">
                                            <strong>ID:</strong> {task.id}
                                        </p>
                                        <p className="description">
                                            <strong>Description:</strong> {task.description}
                                        </p>
                                        <p className="time">{new Date(task.time).toLocaleString()}</p>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}

export default AdminModalSchedule;
