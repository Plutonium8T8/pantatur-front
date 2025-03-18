import { useState, useMemo, useEffect } from "react"
import { RcTable, HeaderCellRcTable } from "../../../RcTable"
import { Checkbox } from "../../../Checkbox"
import { translations } from "../../../utils/translations"
import "./TaskList.css"
import { TypeTask } from "../OptionsTaskType/OptionsTaskType"
import { Button } from "../../../Button"
import { useSnackbar } from "notistack"
import { api } from "../../../../api"
import {
  IoEllipsisHorizontal,
  IoCheckmarkCircle,
  IoTrash,
  IoPencil
} from "react-icons/io5"

const TaskList = ({
  tasks,
  handleMarkAsSeenTask,
  userList = [],
  loading = false,
  openEditTask,
  fetchTasks
}) => {
  const language = localStorage.getItem("language") || "RO"
  const [order, setOrder] = useState("ASC")
  const [selectedRow, setSelectedRow] = useState([])
  const [, setColumn] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)
  const { enqueueSnackbar } = useSnackbar()

  const priorityColors = {
    Low: "#4CAF50",
    Medium: "#FF9800",
    High: "#F44336"
  }

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Sigur doriți să ștergeți acest task?")) return

    try {
      await api.task.delete({ id: taskId })
      enqueueSnackbar("Task șters cu succes!", { variant: "success" })
      fetchTasks()
    } catch (error) {
      enqueueSnackbar("Eroare la ștergerea taskului", { variant: "error" })
    }
  }

  const handleMarkTaskAsComplete = async (taskId) => {
    try {
      await api.task.update({
        id: taskId,
        status: true
      })

      enqueueSnackbar("Task marcat ca finalizat!", { variant: "success" })
      fetchTasks()
    } catch (error) {
      enqueueSnackbar("Eroare la actualizarea statusului taskului", {
        variant: "error"
      })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId &&
        !event.target.closest(".dropdown-menu") && // Если клик не внутри меню
        !event.target.closest(".action-button-task") // И не на кнопку открытия меню
      ) {
        setOpenMenuId(null) // Закрываем меню
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

  const columns = useMemo(
    () => [
      {
        width: 50,
        key: "checkbox",
        align: "center",
        render: (row) => (
          <Checkbox
            checked={selectedRow.includes(row.id)}
            onChange={() => {
              setSelectedRow((prev) =>
                prev.includes(row.id)
                  ? prev.filter((id) => id !== row.id)
                  : [...prev, row.id]
              )
            }}
          />
        )
      },
      {
        title: <HeaderCellRcTable title="ID" order={order} />,
        dataIndex: "id",
        key: "id",
        width: 80,
        align: "center",
        onHeaderCell: () => ({
          onClick: () => {
            setColumn("id")
            setOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"))
          }
        })
      },
      {
        title: (
          <HeaderCellRcTable title="Task pentru Ticket-ul" order={order} />
        ),
        dataIndex: "ticket_id",
        key: "ticket_id",
        width: 120,
        align: "center",
        onHeaderCell: () => ({
          onClick: () => {
            setColumn("ticket_id")
            setOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"))
          }
        })
      },
      {
        title: "Tipul Taskului",
        dataIndex: "task_type",
        key: "task_type",
        width: 180,
        align: "center",
        render: (taskType) => {
          const taskObj = TypeTask.find((task) => task.name === taskType)
          return (
            <div className="task-type">
              {taskObj?.icon || "❓"} <span>{taskType}</span>
            </div>
          )
        }
      },
      {
        title: "Prioritate",
        dataIndex: "priority",
        key: "priority",
        width: 120,
        align: "center",
        render: (priority) => (
          <span
            style={{
              backgroundColor: priorityColors[priority] || "#ccc",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px"
            }}
          >
            {priority}
          </span>
        )
      },
      {
        title: "Etapa Task",
        dataIndex: "status_task",
        key: "status_task",
        width: 120,
        align: "center"
      },
      {
        title: "Creat de",
        dataIndex: "created_by",
        key: "created_by",
        width: 150,
        align: "center",
        render: (_, row) => {
          const creator = userList.find(
            (user) => String(user.id) === String(row.created_by)
          )
          return creator
            ? `${creator.name} ${creator.surname}`
            : `ID: ${row.created_by}`
        }
      },
      {
        title: "Pentru",
        dataIndex: "created_for",
        key: "created_for",
        width: 150,
        align: "center",
        render: (_, row) => {
          const assignedUser = userList.find(
            (user) => String(user.id) === String(row.created_for)
          )
          return assignedUser
            ? `${assignedUser.name} ${assignedUser.surname}`
            : `ID: ${row.created_for}`
        }
      },
      {
        title: "Descriere",
        dataIndex: "description",
        key: "description",
        width: 200,
        align: "center"
      },
      {
        title: "Data",
        dataIndex: "scheduled_time",
        key: "scheduled_time",
        width: 180,
        align: "center",
        render: (date) => {
          const [day, month, year, time] = date.split(/[-\s:]/)
          const formattedDate = new Date(`${year}-${month}-${day}T${time}:00`)
          return isNaN(formattedDate.getTime())
            ? "Invalid Date"
            : formattedDate.toLocaleString()
        }
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        align: "center",
        render: (status) => (
          <span className={status ? "seen" : "unseen"}>
            {status
              ? translations["Văzut"][language]
              : translations["Nevăzut"][language]}
          </span>
        )
      },
      {
        title: "Acțiune",
        dataIndex: "action",
        key: "action",
        width: 150,
        align: "center",
        render: (_, row) => (
          <div className="action-menu">
            <Button
              variant="default"
              className="action-button-task"
              onClick={() => toggleMenu(row.id)}
            >
              <IoEllipsisHorizontal size={18} />
            </Button>

            {openMenuId === row.id && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-item complete"
                  onClick={() => {
                    handleMarkTaskAsComplete(row.id)
                    setOpenMenuId(null)
                  }}
                >
                  <IoCheckmarkCircle size={18} />
                  <span>Finalizați</span>
                </div>
                <div
                  className="dropdown-item edit"
                  onClick={() => {
                    openEditTask(row)
                    setOpenMenuId(null)
                  }}
                >
                  <IoPencil size={18} />
                  <span>Modificați</span>
                </div>
                <div
                  className="dropdown-item delete"
                  onClick={() => {
                    handleDeleteTask(row.id)
                    setOpenMenuId(null)
                  }}
                >
                  <IoTrash size={18} />
                  <span>Ștergeți</span>
                </div>
              </div>
            )}
          </div>
        )
      }
    ],
    [language, userList, handleMarkAsSeenTask, order, selectedRow, openMenuId]
  )

  return (
    <div style={{ margin: "10px" }}>
      <RcTable
        rowKey={({ id }) => id}
        columns={columns}
        data={tasks}
        pagination={{ position: "center", total: tasks.length, pageSize: 10 }}
        selectedRow={selectedRow}
        loading={loading}
        bordered
      />
    </div>
  )
}

export default TaskList
