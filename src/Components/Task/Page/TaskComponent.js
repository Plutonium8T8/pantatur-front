import React, { useState, useEffect } from "react"
import TaskList from "../Components/TaskList/TaskList"
import TaskModal from "../Components/TaskModal/TaskModal"
import { api } from "../../../api"
import { Input } from "../../Input"
import { translations } from "../../utils/translations"
import "./TaskComponent.css"

const TaskComponent = ({ selectTicketId, userId }) => {
  const [tasks, setTasks] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const language = localStorage.getItem("language") || "RO"

  const fetchTasks = async () => {
    try {
      let data = selectTicketId
        ? await api.task.getTaskByTicket(selectTicketId)
        : await api.task.getAllTasks()
      setTasks(data)
    } catch (error) {
      console.error("Ошибка загрузки задач:", error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [selectTicketId])

  const openNewTask = () => {
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const openEditTask = (task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const filteredTasks = tasks.filter((task) =>
    task.task_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="task-container">
      <div className="task-header">
        <div className="name-header">
          {translations["Tasks"][language]} ({filteredTasks.length})
        </div>
        <div className="task-actions">
          <Input
            type="text"
            placeholder={translations["Cautare"][language]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="task-search-input"
          />
          <button className="task-add-button" onClick={openNewTask}>
            + {translations["New Task"][language]}
          </button>
        </div>
      </div>
      <div className="task-list-container">
        <TaskList
          tasks={filteredTasks}
          openEditTask={openEditTask}
          fetchTasks={fetchTasks}
        />
      </div>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fetchTasks={fetchTasks}
        selectedTask={selectedTask}
        defaultTicketId={selectTicketId}
        defaultCreatedBy={userId}
      />
    </div>
  )
}

export default TaskComponent
