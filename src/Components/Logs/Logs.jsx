import { useState, useEffect } from "react"
import { api } from "../../api"
import { enqueueSnackbar } from "notistack"
import { showServerError, getLanguageByKey } from "../utils"
import { Table } from "../Table"
import { cleanValue } from "../utils"
import { format } from "date-fns"
import { dd_MM_yyyy, TIME_FORMAT } from "../../app-constants"
import { parseUserAgent } from "./utils"
import { SpinnerRightBottom } from "../SpinnerRightBottom"

const formatDate = (date) => {
  return format(date, `${dd_MM_yyyy} ${TIME_FORMAT}`)
}

export const Logs = () => {
  const [logList, setLogList] = useState([])
  const [pagination, setPagination] = useState()
  const [loading, setLoading] = useState(false)

  const columns = [
    {
      accessorKey: "id",
      header: () => <div className="text-center">ID</div>,
      accessorFn: ({ id }) => id,
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
    },
    {
      accessorKey: "user_identifier",
      header: () => (
        <div className="text-center">
          {getLanguageByKey("Identificator utilizator")}
        </div>
      ),
      accessorFn: ({ user_identifier }) => user_identifier,
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
    },
    {
      accessorKey: "user_id",
      header: () => (
        <div className="text-center">
          {getLanguageByKey("ID-ul utilizatorului")}
        </div>
      ),
      accessorFn: ({ user_id }) => user_id,
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
    },
    {
      accessorKey: "activity_type",
      header: () => (
        <div className="text-center">{getLanguageByKey("Tip activitate")}</div>
      ),
      accessorFn: ({ activity_type }) => activity_type,
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
    },
    {
      accessorKey: "ip_address",
      header: () => (
        <div className="text-center">{getLanguageByKey("Adresă IP")}</div>
      ),
      accessorFn: ({ ip_address }) => ip_address,
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
    },
    {
      accessorKey: "timestamp",
      header: () => (
        <div className="text-center">
          {getLanguageByKey("Data și ora log-ului")}
        </div>
      ),
      accessorFn: ({ timestamp }) => timestamp,
      cell: ({ getValue }) => (
        <div className="text-center">{formatDate(getValue())}</div>
      )
    },

    {
      accessorKey: "user_agent",
      header: () => (
        <div className="text-center">
          {getLanguageByKey("Sistem și browser")}
        </div>
      ),
      accessorFn: ({ user_agent }) => user_agent,
      cell: ({ getValue }) => cleanValue(parseUserAgent(getValue()).trim())
    },
    {
      accessorKey: "ticketID",
      header: () => (
        <div className="text-center">
          {getLanguageByKey("ID-ul tichetului")}
        </div>
      ),
      accessorFn: ({ additional_data }) => additional_data?.ticket.id,
      cell: ({ getValue }) => (
        <div className="text-center">{cleanValue(getValue())}</div>
      )
    },
    {
      accessorKey: "additional_data",
      header: () => (
        <div className="text-center">{getLanguageByKey("Workflow")}</div>
      ),
      accessorFn: ({ additional_data }) => additional_data?.data.workflow,
      cell: ({ getValue }) => (
        <div className="text-center">{cleanValue(getValue())}</div>
      )
    },
    {
      accessorKey: "creation_date",
      header: () => (
        <div className="text-center">{getLanguageByKey("Data de creare")}</div>
      ),
      accessorFn: ({ additional_data }) =>
        additional_data?.ticket?.creation_date,
      cell: ({ getValue }) => {
        const value = getValue()
        return <div className="text-center">{cleanValue(value)}</div>
      }
    },
    {
      accessorKey: "last_interaction_date",
      header: () => (
        <div className="text-center">
          {getLanguageByKey("Ultima interacțiune")}
        </div>
      ),
      accessorFn: ({ additional_data }) =>
        additional_data?.ticket?.last_interaction_date,
      cell: ({ getValue }) => {
        const value = getValue()
        return <div className="text-center">{cleanValue(value)}</div>
      }
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="text-center">
          {getLanguageByKey("Statusul tichetului")}
        </div>
      ),
      accessorFn: ({ additional_data }) => {
        const status = additional_data?.ticket?.status
        return status ? `${status}` : status
      },
      cell: ({ getValue }) => {
        const value = getValue()
        return <div className="text-center">{cleanValue(value)}</div>
      }
    },
    {
      accessorKey: "priority",
      header: () => (
        <div className="text-center">{getLanguageByKey("Prioritate")}</div>
      ),
      accessorFn: ({ additional_data }) => additional_data?.ticket?.priority,
      cell: ({ getValue }) => {
        const value = getValue()
        return <div className="text-center">{cleanValue(value)}</div>
      }
    }
  ]

  useEffect(() => {
    const getLogList = async () => {
      setLoading(true)
      try {
        const logs = await api.activity.getLogList({
          page: pagination?.currentPage
        })
        setLogList(logs.data)
        setPagination({
          totalPages: logs.meta.totalPages,
          currentPage: logs.meta.currentPage
        })
      } catch (error) {
        enqueueSnackbar(showServerError(error), { variant: "error" })
      } finally {
        setLoading(false)
      }
    }
    getLogList()
  }, [pagination?.currentPage])

  if (loading) {
    return <SpinnerRightBottom />
  }

  return (
    <div>
      <Table
        columns={columns}
        data={logList}
        pagination={{
          ...pagination,
          onPaginationChange: (page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
        }}
      />
    </div>
  )
}
