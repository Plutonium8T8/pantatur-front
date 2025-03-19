import React, { useState, useEffect } from "react"
import { Modal, Textarea, Button, Select as MantineSelect } from "@mantine/core"
import { DateTimePicker } from "@mantine/dates"
import { useSnackbar } from "notistack"
import { api } from "../../../../api"
import IconSelect from "../../../IconSelect/IconSelect"
import { TypeTask } from "../OptionsTaskType/OptionsTaskType"
import { translations } from "../../../utils/translations"

const TaskModal = ({
  isOpen,
  onClose,
  fetchTasks,
  selectedTask,
  defaultTicketId,
  defaultCreatedBy
}) => {
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
  const [loading, setLoading] = useState(false)
  const language = localStorage.getItem("language") || "RO"

  useEffect(() => {
    if (!isOpen) return

    fetchTickets()
    fetchUsers()

    if (selectedTask) {
      // Если редактируем таск – загружаем его данные
      setTask({
        ticketId: selectedTask.ticket_id,
        scheduledTime: selectedTask.scheduled_time || "",
        description: selectedTask.description || "",
        taskType: selectedTask.task_type || "",
        createdBy: selectedTask.created_by,
        createdFor: selectedTask.created_for || "",
        priority: selectedTask.priority || "Medium",
        status_task: selectedTask.status_task || "To Do"
      })
    } else {
      // Если создаем новый таск – сбрасываем все поля
      setTask({
        ticketId: defaultTicketId || "",
        scheduledTime: "",
        description: "",
        taskType: "",
        createdBy: defaultCreatedBy || "",
        createdFor: "",
        priority: "Medium",
        status_task: "To Do"
      })
    }
  }, [isOpen])

  const handleClose = () => {
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
    onClose()
  }

  const fetchTickets = async () => {
    try {
      const data = await api.tickets.list()
      setTicketIds(data.map((ticket) => ticket.id.toString()))
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
  const parseDate = (dateString) => {
    if (!dateString) return null

    const regex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
    const match = dateString.match(regex)

    if (!match) return null

    const [, day, month, year, hours, minutes, seconds] = match
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`)
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
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
          value={task.ticketId ? task.ticketId.toString() : ""}
          onChange={(value) =>
            setTask((prev) => ({ ...prev, ticketId: value }))
          }
          searchable
          placeholder={translations["Lead ID"][language]}
          required
          clearable
          mb="md"
          disabled={!!defaultTicketId}
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
          searchable
          mt="md"
        />

        <MantineSelect
          label={translations["Status"][language]}
          data={["To Do", "In Progress", "Done", "Overdue"]}
          value={task.status_task}
          onChange={(value) => setTask({ ...task, status_task: value })}
          required
          searchable
          mt="md"
        />

        <DateTimePicker
          label={translations["Dată și oră"][language]}
          value={parseDate(task.scheduledTime)}
          onChange={(value) => {
            setTask({
              ...task,
              scheduledTime: value ? value.toISOString() : ""
            })
          }}
          required
          clearable
          searchable
          mt="md"
        />

        <Textarea
          label={translations["Descriere task"][language]}
          name="description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          required
          autosize
          minRows={3}
          maxRows={6}
          mt="md"
        />

        <MantineSelect
          label={translations["Pentru"][language]}
          data={userList}
          value={task.createdFor}
          onChange={(value) => setTask({ ...task, createdFor: value })}
          required
          searchable
          mt="md"
        />

        <MantineSelect
          label={translations["De la utilizatorul"][language]}
          data={userList}
          value={task.createdBy ? task.createdBy.toString() : ""}
          onChange={(value) =>
            setTask((prev) => ({ ...prev, createdBy: value }))
          }
          required
          searchable
          mt="md"
          disabled={!!defaultCreatedBy}
        />

        <Button type="submit" loading={loading} mt="md">
          {selectedTask
            ? translations["Editare Task"][language]
            : translations["Adaugă task"][language]}
        </Button>
        <Button variant="outline" onClick={onClose} mt="md" ml="md">
          {translations["Anulare"][language]}
        </Button>
      </form>
    </Modal>
  )
}

export default TaskModal
