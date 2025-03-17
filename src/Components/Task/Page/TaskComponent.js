import React, { useState, useEffect } from "react"
import TaskModal from "../Components/TaskModal/TaskModal"
import TaskList from "../Components/TaskList/TaskList"
import { api } from "../../../api"
import ".//TaskComponent.css"
const TaskComponent = () => {
  const [tasks, setTasks] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchTasks = async () => {
    const data = await api.task.getAllTasks()
    setTasks(data)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="task-container">
      <div className="task-header">
        <h2>Tasks</h2>
        <button
          className="task-add-button"
          onClick={() => setIsModalOpen(true)}
        >
          + New Task
        </button>
      </div>
      <div className="task-list-container">
        <TaskList tasks={tasks} />
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
