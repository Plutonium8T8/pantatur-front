import React, { useState, useEffect } from "react";
import { useUser } from "../../../hooks";
import { useSnackbar } from "notistack";
import { translations } from "../../utils/translations";
import { api } from "../../../api";
import { Input } from "../../Input";
import IconSelect from "../../IconSelect/IconSelect";
import "../Task.css"
import { TypeTask } from "./OptionsTaskType"

const TaskModal = ({ isOpen, onClose, fetchTasks, selectedTicketId }) => {
    const [taskContent, setTaskContent] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [ticketId, setTicketId] = useState(null);
    const [ticketIds, setTicketIds] = useState([]);
    const [taskFor, setTaskFor] = useState("");
    const [userList, setUserList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { userId, name, surname } = useUser();
    const { enqueueSnackbar } = useSnackbar();
    const language = localStorage.getItem("language") || "RO";
    const [selectedTask, setSelectedTask] = useState("")
    const [searchUserFrom, setSearchUserFrom] = useState("");
    const [isUserFromDropdownOpen, setIsUserFromDropdownOpen] = useState(false);
    const [taskFrom, setTaskFrom] = useState(""); // ID пользователя, от кого таск

    useEffect(() => {
        if (isOpen) {
            fetchTicketsID();
            fetchUsers();
            if (selectedTicketId) {
                setTicketId(selectedTicketId);
                setSearchTerm(selectedTicketId.toString());
            }
        }
    }, [isOpen, selectedTicketId]);

    const fetchTicketsID = async () => {
        try {
            const data = await api.tickets.list();
            setTicketIds(data.map(ticket => ticket.id));
        } catch (error) {
            console.error("Error fetching tickets:", error.message);
        }
    };

    const fetchUsers = async () => {
        try {
            const usersData = await api.users.getTechnicianList();
            setUserList(usersData.map(user => ({
                id: user.id.id,
                name: user.id.name || "N/A",
                surname: user.id.surname || "N/A"
            })));
        } catch (error) {
            enqueueSnackbar("Error loading users", { variant: "error" });
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (!ticketId || !taskDate || !taskContent || !taskFor || !taskFrom || !selectedTask) {
            enqueueSnackbar("Toate câmpurile sunt obligatorii", { variant: "warning" });
            return;
        }

        try {
            await api.task.create({
                ticket_id: ticketId,
                scheduled_time: taskDate,
                description: taskContent,
                task_type: [selectedTask], // Теперь selectedTask включен в отправку
                created_by: taskFrom, // Указано от кого таск
                created_for: taskFor
            });

            fetchTasks();
            setTaskContent("");
            setTaskDate("");
            setTaskFor("");
            setTaskFrom(""); // Очищаем taskFrom после создания
            setSelectedTask("");
            onClose();
        } catch (error) {
            enqueueSnackbar("Eroare la crearea taskului", { variant: "error" });
        }
    };

    return isOpen ? (
        <div className="task-modal-overlay" onClick={onClose}>
            <div className="task-modal-container" onClick={(e) => e.stopPropagation()}>
                <header className="task-modal-header">
                    <h2>{["Taskuri"]}</h2>
                </header>

                <form onSubmit={handleTaskSubmit} className="task-form">
                    <div className="task-input-group">
                        <label>{["Lead"]} ID</label>
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            required
                        />
                        {isDropdownOpen && (
                            <ul className="task-dropdown-list">
                                {ticketIds.filter(id => id.toString().includes(searchTerm)).map(id => (
                                    <li key={id} onMouseDown={() => { setTicketId(id); setSearchTerm(id); }}>
                                        {id}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div>
                            <IconSelect
                                options={TypeTask}
                                label="Alege tip task"
                                id="task-select"
                                value={selectedTask}
                                onChange={setSelectedTask}
                                placeholder="Alege tip task"
                            />
                        </div>
                    </div>

                    <div className="task-input-group">
                        <label>{["Dată și oră"]}</label>
                        <input type="datetime-local" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} required />
                    </div>

                    <div className="task-input-group">
                        <label>{["Descriere task"]}</label>
                        <textarea value={taskContent} onChange={(e) => setTaskContent(e.target.value)} required />
                    </div>

                    <div className="task-input-group">
                        <label>{["Pentru"]}</label>
                        <Input
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                            onFocus={() => setIsUserDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
                            required
                        />
                        {isUserDropdownOpen && (
                            <ul className="task-dropdown-list">
                                {userList.filter(user =>
                                    `${user.id} ${user.name} ${user.surname}`.toLowerCase().includes(searchUser.toLowerCase())
                                ).map(user => (
                                    <li key={user.id} onMouseDown={() => { setTaskFor(user.id); setSearchUser(`${user.id} - ${user.name} ${user.surname}`); }}>
                                        {user.id} - {user.name} {user.surname}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="task-input-group">
                        <label>{["De la utilizatorul"]}</label>
                        <Input
                            value={searchUserFrom}
                            onChange={(e) => setSearchUserFrom(e.target.value)}
                            onFocus={() => setIsUserFromDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsUserFromDropdownOpen(false), 200)}
                            required
                        />
                        {isUserFromDropdownOpen && (
                            <ul className="task-dropdown-list">
                                {userList.filter(user =>
                                    `${user.id} ${user.name} ${user.surname}`.toLowerCase().includes(searchUserFrom.toLowerCase())
                                ).map(user => (
                                    <li key={user.id} onMouseDown={() => { setTaskFrom(user.id); setSearchUserFrom(`${user.id} - ${user.name} ${user.surname}`); }}>
                                        {user.id} - {user.name} {user.surname}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>


                    <button type="submit" className="task-submit-button">{["Adaugă task"]}</button>
                </form>
            </div>
        </div>
    ) : null;
};

export default TaskModal;