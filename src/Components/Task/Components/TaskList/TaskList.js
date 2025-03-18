import { useState, useMemo } from "react"
import { RcTable, HeaderCellRcTable } from "../../../RcTable"
import { Checkbox } from "../../../Checkbox"
import { translations } from "../../../utils/translations"
import "./TaskList.css"
import { TypeTask } from "../OptionsTaskType/OptionsTaskType"
import { Button } from "../../../Button"

const TaskList = ({
  tasks,
  handleMarkAsSeenTask,
  userList = [],
  loading = false
}) => {
  const language = localStorage.getItem("language") || "RO"
  const [order, setOrder] = useState("ASC")
  const [selectedRow, setSelectedRow] = useState([])
  const [, setColumn] = useState("")

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
        title: <HeaderCellRcTable title="Task pentru ticket" order={order} />,
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
        title: "Tip Task",
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
        render: (_, row) =>
          !row.status && (
            <Button
              onClick={() => handleMarkAsSeenTask(row.id)}
              variant="primary"
            >
              {translations["Marchează"][language]}
            </Button>
          )
      }
    ],
    [language, userList, handleMarkAsSeenTask, order, selectedRow]
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
