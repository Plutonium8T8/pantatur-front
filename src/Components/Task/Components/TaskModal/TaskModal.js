import React, { useState, useEffect } from "react"
import { Modal, Button, Select as MantineSelect } from "@mantine/core"
import { useSnackbar } from "notistack"
import { api } from "../../../../api"
import { Input } from "../../../Input"
import IconSelect from "../../../IconSelect/IconSelect"
import { TypeTask } from "../OptionsTaskType/OptionsTaskType"
import { translations } from "../../../utils/translations"

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
  const [loading, setLoading] = useState(false)
  const language = localStorage.getItem("language") || "RO"

  useEffect(() => {
    if (isOpen) {
      fetchTickets()
      fetchUsers()

      if (selectedTask) {
        setTask({
          ticketId: selectedTask.ticket_id,
          scheduledTime: selectedTask.scheduled_time,
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
      setTicketIds(data.map((ticket) => ticket.id.toString())) // Преобразуем ID в строки для Mantine Select
    } catch (error) {
      enqueueSnackbar("Eroare la încărcarea tichetelor", { variant: "error" })
    }
  }

  const fetchUsers = async () => {
    try {
      const usersData = await api.users.getTechnicianList()
      setUserList(
        usersData.map((user) => ({
          value: user.id.id.toString(),
          label: `${user.id.name || "N/A"} ${user.id.surname || "N/A"}`
        }))
      )
    } catch (error) {
      enqueueSnackbar("Eroare la încărcarea utilizatorilor", {
        variant: "error"
      })
    }
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
        await api.task.update({ id: selectedTask.id, ...task })
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

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        selectedTask
          ? translations["Editare Task"][language]
          : translations["Creare Task"][language]
      }
      centered
      size="xl"
    >
      <form onSubmit={handleTaskSubmit} className="task-form">
        <MantineSelect
          label={translations["Lead ID"][language]}
          data={ticketIds}
          value={task.ticketId}
          onChange={(value) => setTask({ ...task, ticketId: value })}
          searchable
          placeholder={translations["Lead ID"][language]}
          required
          clearable
        />

        <IconSelect
          options={TypeTask}
          label="Alege tip task"
          id="task-select"
          value={task.taskType}
          onChange={(value) =>
            setTask((prev) => ({ ...prev, taskType: value }))
          }
          placeholder="Alege tip task"
        />

        <MantineSelect
          label={translations["Prioritate"][language]}
          data={["Low", "Medium", "High"]}
          value={task.priority}
          onChange={(value) => setTask({ ...task, priority: value })}
          required
        />

        <MantineSelect
          label={translations["Status"][language]}
          data={["To Do", "In Progress", "Done", "Overdue"]}
          value={task.status_task}
          onChange={(value) => setTask({ ...task, status_task: value })}
          required
        />

        <Input
          type="datetime-local"
          label={translations["Dată și oră"][language]}
          name="scheduledTime"
          value={task.scheduledTime}
          onChange={(e) => setTask({ ...task, scheduledTime: e.target.value })}
          required
        />

        <Input
          type="textarea"
          label={translations["Descriere task"][language]}
          name="description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          required
        />

        <MantineSelect
          label={translations["Pentru"][language]}
          data={userList}
          value={task.createdFor}
          onChange={(value) => setTask({ ...task, createdFor: value })}
          required
        />

        <MantineSelect
          label={translations["De la utilizatorul"][language]}
          data={userList}
          value={task.createdBy}
          onChange={(value) => setTask({ ...task, createdBy: value })}
          required
        />

        <Button type="submit" loading={loading}>
          {selectedTask
            ? translations["Editare Task"][language]
            : translations["Adaugă task"][language]}
        </Button>
        <Button variant="outline" onClick={onClose}>
          {translations["Anulare"][language]}
        </Button>
      </form>
    </Modal>
  )
}

export default TaskModal
