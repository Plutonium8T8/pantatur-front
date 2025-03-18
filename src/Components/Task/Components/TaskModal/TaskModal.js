import React, { useState, useEffect } from "react"
import { useSnackbar } from "notistack"
import { api } from "../../../../api"
import { Input } from "../../../Input"
import IconSelect from "../../../IconSelect/IconSelect"
import { TypeTask } from "../OptionsTaskType/OptionsTaskType"
import "./TaskModal.css"

const TaskModal = ({ isOpen, onClose, fetchTasks, selectedTask }) => {
  const { enqueueSnackbar } = useSnackbar()

  const [task, setTask] = useState({
    ticketId: "",
    scheduledTime: "",
    description: "",
    taskType: "",
    createdBy: "",
    createdFor: "",
    priority: "Medium",
    status_task: "To Do"
  })

  const [ticketIds, setTicketIds] = useState([])
  const [userList, setUserList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatDateTime = (dateString) => {
    if (!dateString) return ""

    const regex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
    const match = dateString.match(regex)

    if (!match) return ""

    const [, day, month, year, hours, minutes] = match

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  useEffect(() => {
    if (isOpen) {
      fetchTickets()
      fetchUsers()

      if (selectedTask) {
        setTask({
          ticketId: selectedTask.ticket_id,
          scheduledTime: formatDateTime(selectedTask.scheduled_time),
          description: selectedTask.description,
          taskType: selectedTask.task_type,
          createdBy: selectedTask.created_by,
          createdFor: selectedTask.created_for,
          priority: selectedTask.priority,
          status_task: selectedTask.status_task
        })
        setSearchTerm(selectedTask.ticket_id.toString())
      } else {
        setTask({
          ticketId: "",
          scheduledTime: "",
          description: "",
          taskType: "",
          createdBy: "",
          createdFor: "",
          priority: "Medium",
          status_task: "To Do"
        })
        setSearchTerm("")
      }
    }
  }, [isOpen, selectedTask])

  const fetchTickets = async () => {
    try {
      const data = await api.tickets.list()
      setTicketIds(data.map((ticket) => ticket.id))
    } catch (error) {
      enqueueSnackbar("Eroare la încărcarea tichetelor", { variant: "error" })
    }
  }

  const fetchUsers = async () => {
    try {
      const usersData = await api.users.getTechnicianList()
      setUserList(
        usersData.map((user) => ({
          id: user.id.id,
          name: user.id.name || "N/A",
          surname: user.id.surname || "N/A"
        }))
      )
    } catch (error) {
      enqueueSnackbar("Eroare la încărcarea utilizatorilor", {
        variant: "error"
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    if (
      !task.ticketId ||
      !task.scheduledTime ||
      !task.description ||
      !task.createdBy ||
      !task.createdFor ||
      !task.taskType ||
      !task.priority ||
      !task.status_task
    ) {
      enqueueSnackbar("Toate câmpurile sunt obligatorii", {
        variant: "warning"
      })
      return
    }

    setLoading(true)
    try {
      if (selectedTask) {
        const updatedFields = { id: selectedTask.id }

        for (const key in task) {
          if (task[key] !== selectedTask[key]) {
            updatedFields[key] = task[key]
          }
        }

        await api.task.update({
          id: selectedTask.id,
          ...updatedFields
        })
        enqueueSnackbar("Task actualizat cu succes!", { variant: "success" })
      } else {
        await api.task.create({
          ticket_id: task.ticketId,
          scheduled_time: task.scheduledTime,
          description: task.description,
          task_type: task.taskType,
          created_by: task.createdBy,
          created_for: task.createdFor,
          priority: task.priority,
          status_task: task.status_task
        })
        enqueueSnackbar("Task adăugat cu succes!", { variant: "success" })
      }

      fetchTasks()
      onClose()
    } catch (error) {
      enqueueSnackbar("Eroare la salvarea taskului", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return isOpen ? (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        className="task-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="task-modal-header">
          <h2>{selectedTask ? "Editare Task" : "Creare Task"}</h2>
        </header>

        <form onSubmit={handleTaskSubmit} className="task-form">
          <div className="task-input-group">
            <label>Lead ID</label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              required
            />
            {isDropdownOpen && (
              <ul className="task-dropdown-list">
                {ticketIds
                  .filter((id) => id.toString().includes(searchTerm))
                  .map((id) => (
                    <li
                      key={id}
                      onMouseDown={() => {
                        setTask({ ...task, ticketId: id })
                        setSearchTerm(id)
                      }}
                    >
                      {id}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <IconSelect
            options={TypeTask}
            label="Alege tip task"
            id="task-select"
            value={task.taskType}
            onChange={(value) => {
              const taskName = value.split(" ")[1] || value
              setTask((prev) => ({ ...prev, taskType: taskName }))
            }}
            placeholder="Alege tip task"
          />

          <div className="task-input-group">
            <label>Prioritate</label>
            <select
              name="priority"
              value={task.priority}
              onChange={handleInputChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="task-input-group">
            <label>Status</label>
            <select
              name="status_task"
              value={task.status_task}
              onChange={handleInputChange}
              required
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="task-input-group">
            <label>Dată și oră</label>
            <input
              type="datetime-local"
              name="scheduledTime"
              value={task.scheduledTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="task-input-group">
            <label>Descriere task</label>
            <textarea
              name="description"
              value={task.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="task-input-group">
            <label>Pentru</label>
            <select
              name="createdFor"
              value={task.createdFor}
              onChange={handleInputChange}
              required
            >
              <option value="">Selectează utilizator</option>
              {userList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname}
                </option>
              ))}
            </select>
          </div>

          <div className="task-input-group">
            <label>De la utilizatorul</label>
            <select
              name="createdBy"
              value={task.createdBy}
              onChange={handleInputChange}
              required
            >
              <option value="">Selectează utilizator</option>
              {userList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="task-submit-button"
            disabled={loading}
          >
            {loading ? "Se încarcă..." : "Adaugă task"}
          </button>
        </form>
      </div>
    </div>
  ) : null
}

export default TaskModal
