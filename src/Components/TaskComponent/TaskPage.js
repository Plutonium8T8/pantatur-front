import React, { useState, useEffect } from "react"
import { useUser } from "../../UserContext"
import "./TaskComponent.css"
import { translations } from "../utils/translations"
import { api } from "../../api"
import { showServerError } from "../../Components/utils/showServerError"
import { useSnackbar } from "notistack"
import { Input } from "../Input"
import IconSelect from "../IconSelect/IconSelect";
import { TypeTask } from "./OptionsTaskType"

const TaskPage = ({ selectedTicketId }) => {
  const [tasks, setTasks] = useState([])
  const [taskContent, setTaskContent] = useState("")
  const [taskDate, setTaskDate] = useState("")
  const [ticketId, setTicketId] = useState(selectedTicketId || null)
  const { userId, name, surname } = useUser()
  const [error, setError] = useState(null)
  const [ticketIds, setTicketIds] = useState([])
  const [taskFor, setTaskFor] = useState("")
  const [userList, setUserList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchUser, setSearchUser] = useState("")
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const language = localStorage.getItem("language") || "RO"
  const [selectedTask, setSelectedTask] = useState("")

  useEffect(() => {
    fetchTasks()
    fetchTicketsID()
    fetchUsers()
  }, [])

  const fetchTicketsID = async () => {
    try {
      const data = await api.tickets.list()
      setTicketIds(data.map((ticket) => ticket.id))
    } catch (error) {
      console.error("Error fetching tickets:", error.message)
    }
  }

  const fetchTasks = async () => {
    try {
      const data = await api.task.getByUserId(userId)
      setTasks(data)
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    }
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    if (!ticketId || !taskDate || !taskContent || !taskFor) {
      setError("Все поля должны быть заполнены!")
      enqueueSnackbar("Все поля должны быть заполнены!", { variant: "warning" })
      return
    }

    try {
      await api.task.create({
        ticket_id: ticketId,
        scheduled_time: taskDate,
        description: taskContent,
        tags: [""],
        created_by: userId,
        created_for: taskFor
      })

      fetchTasks()
      setTaskContent("")
      setTaskDate("")
      setTaskFor("")
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    }
  }

  const handleClearAllTasks = async () => {
    try {
      await api.task.delete({ technician_id: userId })
      setTasks([])
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    }
  }

  const fetchUsers = async () => {
    try {
      const usersData = await api.users.getTechnicianList()
      setUserList(usersData.map(user => ({
        id: user.id,
        name: user.name || "N/A",
        surname: user.surname || "N/A"
      })))
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    }
  }
  // Запуск загрузки пользователей при монтировании компонента
  useEffect(() => {
    fetchUsers()
  }, [userId])

  const handleInputChange = (e) => {
    const inputValue = e.target.value
    setSearchTerm(inputValue)
    setIsDropdownOpen(true)
    if (ticketIds.includes(Number(inputValue))) {
      setTicketId(Number(inputValue))
    }
  }

  const handleSelect = (id) => {
    setTicketId(id)
    setSearchTerm(id)
    setIsDropdownOpen(false)
  }

  const handleUserInputChange = (e) => {
    setSearchUser(e.target.value)
    setIsUserDropdownOpen(true)
  }

  const handleUserSelect = (user) => {
    setTaskFor(Number(user.id))
    setSearchUser(`${user.id} - ${user.name || "N/A"} ${user.surname || "N/A"}`)
    setIsUserDropdownOpen(false)
  }

  const handleMarkAsSeenTask = async (id) => {
    try {
      await api.task.update({
        id: id,
        status: true
      })

      fetchTasks()
    } catch (error) {
      enqueueSnackbar(showServerError(error), { variant: "error" })
    }
  }

  return (
    <div className="task-container" onClick={(e) => e.stopPropagation()}>
      <header className="task-header">
        <h2>{translations["Taskuri"][language]}</h2>
      </header>
      {error && <div className="error-message">{error}</div>}

      <form className="notification-form" onSubmit={handleTaskSubmit}>
        <div className="input-group-task" style={{ position: "relative" }}>
          <label htmlFor="ticket-select">
            {translations["Lead"][language]} ID
          </label>
          <Input
            id="ticket-select"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            placeholder={translations["Alege ID lead"][language]}
            required
          />
          <IconSelect
            options={TypeTask}
            label="Выберите задачу"
            id="task-select"
            value={selectedTask}
            onChange={setSelectedTask}
            placeholder="Выберите задачу"
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

        <div className="input-group-task">
          <label htmlFor="task-date">
            {translations["Dată și oră"][language]}
          </label>
          <input
            id="task-date"
            type="datetime-local"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            required
          />
        </div>
        <div className="input-group-task">
          <label htmlFor="task-content">
            {translations["Descriere task"][language]}
          </label>
          <textarea
            id="task-content"
            className="task-textarea"
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
            placeholder={translations["Descriere task"][language]}
            rows="4"
            required
          />
        </div>
        <div className="input-group-task">
          <label htmlFor="created-by">
            {translations["Creat de"][language]}
          </label>
          <Input
            id="created-by"
            value={`${userId} - ${name ? name : "N/A"} ${surname ? surname : "N/A"}`}
            disabled
          />
        </div>

        <div className="input-group-task" style={{ position: "relative" }}>
          <label htmlFor="for-user">{translations["Pentru"][language]}</label>
          <Input
            id="for-user"
            value={searchUser}
            onChange={handleUserInputChange}
            onFocus={() => setIsUserDropdownOpen(true)} // Открываем список при фокусе
            onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)} // Закрытие списка после потери фокуса
            placeholder={translations["Alege utilizator"][language]}
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
                  <li
                    key={user.id}
                    onMouseDown={() => handleUserSelect(user)}
                  >
                    {`${user.id} - ${user.name || "N/A"} ${user.surname || "N/A"}`}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="button-container">
          <button className="submit-button" type="submit">
            {translations["Adaugă task"][language]}
          </button>
          <button
            className="clear-button"
            type="button"
            onClick={handleClearAllTasks}
          >
            {translations["Șterge toate"][language]}
          </button>
        </div>
      </form>

      <ul className="notification-list">
        {tasks.length === 0 ? (
          <li className="no-notifications">
            {translations["Nici un task"][language]}
          </li>
        ) : (
          tasks.map((task) => {
            // Найти пользователя по его ID в списке userList
            const assignedUser = userList.find(
              (user) => user.id === task.created_for
            )

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
                      <strong>{translations["Creat de"][language]}:</strong>{" "}
                      {task.created_by}
                    </p>
                    <p className="description">
                      <strong>{translations["Pentru"][language]}:</strong>
                      {assignedUser
                        ? `${assignedUser.name} ${assignedUser.surname}`
                        : `ID: ${task.created_for}`}
                    </p>
                    <p className="description">
                      <strong>{translations["Descriere"][language]}:</strong>{" "}
                      {task.description}
                    </p>
                    <p className="time">
                      {new Date(task.scheduled_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="action-group">
                  <p className={`status ${task.status ? "seen" : "unseen"}`}>
                    {task.status
                      ? translations["Văzut"][language]
                      : translations["Nevăzut"][language]}
                  </p>
                  {!task.status && (
                    <button
                      className="mark-as-seen"
                      onClick={() => handleMarkAsSeenTask(task.id)}
                    >
                      {translations["Marchează"][language]}
                    </button>
                  )}
                </div>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

export default TaskPage