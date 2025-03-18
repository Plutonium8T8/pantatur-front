import React, { useState, useEffect } from "react"
import TaskModal from "../Components/TaskModal/TaskModal"
import TaskList from "../Components/TaskList/TaskList"
import { api } from "../../../api"
import { Input } from "../../Input"
import "./TaskComponent.css"

const TaskComponent = () => {
  const [tasks, setTasks] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchTasks = async () => {
    const data = await api.task.getAllTasks()
    setTasks(data)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((task) =>
    task.task_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="task-container">
      <div className="task-header">
        <div className="name-header">Tasks ({filteredTasks.length})</div>
        <div className="task-actions">
          <Input
            type="text"
            placeholder="Cautare"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="task-search-input"
          />
          <button
            className="task-add-button"
            onClick={() => setIsModalOpen(true)}
          >
            + New Task
          </button>
        </div>
      </div>
      <div className="task-list-container">
        <TaskList tasks={filteredTasks} />
      </div>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fetchTasks={fetchTasks}
      />
    </div>
  )
}

export default TaskComponent
