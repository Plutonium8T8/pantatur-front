import { useState, useEffect } from "react"
import { Drawer, Button } from "@mantine/core"
import TaskList from "../TaskList/TaskList"
import TaskModal from "../TaskModal/TaskModal"
import { translations } from "../../../utils/translations"
import { api } from "../../../../api"

const TaskListOverlay = ({ ticketId, userId, openEditTask }) => {
  const [opened, setOpened] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const language = localStorage.getItem("language") || "RO"

  const fetchTasks = async () => {
    try {
      let data
      if (ticketId) {
        console.log(`🔍 Загружаем задачи для тикета ${ticketId}`)
        data = await api.task.getTaskByTicket(ticketId)
      } else {
        console.log("📋 Загружаем все задачи...")
        data = await api.task.getAllTasks()
      }
      setTasks(data)
    } catch (error) {
      console.error("Ошибка загрузки задач:", error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [ticketId])

  return (
    <>
      <Button
        fullWidth
        color={tasks.length > 0 ? "blue" : "gray"}
        onClick={() => setOpened(true)}
      >
        {tasks.length > 0
          ? `Для этого тикета есть ${tasks.length} задача(и)`
          : "Нет задач. Cоздать?"}
      </Button>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="bottom"
        padding="md"
        size="lg"
      >
        <Button
          fullWidth
          color="green"
          onClick={() => setTaskModalOpen(true)}
          mb="md"
        >
          {["Создать задачу"]}
        </Button>

        <TaskList
          tasks={tasks}
          fetchTasks={fetchTasks}
          openEditTask={openEditTask}
        />

        {/* Теперь передаем userId в TaskModal */}
        <TaskModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          defaultTicketId={ticketId}
          defaultCreatedBy={userId} // <-- Передаем userId
          fetchTasks={fetchTasks}
        />
      </Drawer>
    </>
  )
}

export default TaskListOverlay
