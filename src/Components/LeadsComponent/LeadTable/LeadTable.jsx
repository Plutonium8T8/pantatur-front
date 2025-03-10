import { useMemo } from "react"
import { Link } from "react-router-dom"
import { cleanValue } from "../utils"
import { workflowStyles } from "../../utils/workflowStyles"
import "./LeadTable.css"
import { SpinnerRightBottom } from "../../SpinnerRightBottom"
import { Pagination } from "../../Pagination"
import { getLanguageByKey } from "../../utils/getLanguageByKey"
import { TextEllipsis } from "../../TextEllipsis"
import { Table } from "../../Table"
import { Checkbox } from "../../Checkbox"

const renderTags = (tags) => {
  const isTags = tags.some(Boolean)

  return isTags
    ? tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag.trim()}
        </span>
      ))
    : "—"
}

export const LeadTable = ({
  selectedTickets,
  toggleSelectTicket,
  filteredLeads,
  totalLeads,
  onChangePagination,
  currentPage,
  loading
}) => {
  const columns = useMemo(() => {
    return [
      {
        accessorKey: "check",
        header: () => (
          <div className="text-center">{getLanguageByKey("Verificare")}</div>
        ),
        accessorFn: ({ id }) => id,
        cell: ({ getValue }) => (
          <div className="text-center">
            <Checkbox
              checked={selectedTickets.includes(getValue())}
              onChange={() => toggleSelectTicket(getValue())}
            />
          </div>
        )
      },
      {
        accessorKey: "id",
        header: () => <div className="text-center">ID</div>,
        accessorFn: ({ id }) => id,
        cell: ({ getValue }) => {
          const id = getValue()
          return (
            <div className="text-center">
              <Link to={`/chat/${id}`} className="row-id">
                #{id}
              </Link>
            </div>
          )
        }
      },
      {
        accessorKey: "name",
        header: () => (
          <div className="text-center">{getLanguageByKey("Nume")}</div>
        ),
        accessorFn: ({ clients }) => clients,
        cell: ({ getValue }) => {
          const values = getValue()

          return (
            <div className="text-center">
              {values?.length
                ? values?.map((item) => cleanValue(item.name)).join(", ")
                : cleanValue()}
            </div>
          )
        }
      },
      {
        accessorKey: "surname",
        header: () => (
          <div className="text-center">{getLanguageByKey("Prenume")}</div>
        ),
        accessorFn: ({ clients }) => clients,
        cell: ({ getValue }) => {
          const values = getValue()
          return (
            <div className="text-center">
              {values?.length
                ? values?.map((item) => cleanValue(item?.surname)).join(", ")
                : cleanValue()}
            </div>
          )
        }
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="text-center">{getLanguageByKey("Email")}</div>
        ),
        accessorFn: ({ clients }) => clients,
        cell: ({ getValue }) => {
          const values = getValue()

          return (
            <div className="text-center">
              {values?.length
                ? values?.map((item) => cleanValue(item.email)).join(", ")
                : cleanValue()}
            </div>
          )
        }
      },
      {
        header: () => (
          <div className="text-center">{getLanguageByKey("Telefon")}</div>
        ),
        accessorKey: "phone",
        accessorFn: ({ clients }) => clients,
        cell: ({ getValue }) => {
          const values = getValue()

          return (
            <div className="text-center">
              {values?.length
                ? values?.map((item) => cleanValue(item?.phone)).join(", ")
                : cleanValue()}
            </div>
          )
        }
      },
      {
        header: getLanguageByKey("Descriere"),
        accessorKey: "description",
        accessorFn: ({ description }) => cleanValue(description),
        cell: ({ getValue }) => (
          <div className="limit-text" style={{ width: 200 }}>
            <TextEllipsis rows={3}>{getValue()}</TextEllipsis>
          </div>
        )
      },
      {
        header: getLanguageByKey("Tag-uri"),
        accessorKey: "tags",
        accessorFn: ({ tags }) => tags,
        cell: ({ getValue }) => (
          <div style={{ width: 300 }} className="d-flex gap-8 flex-wrap">
            {renderTags(getValue())}
          </div>
        )
      },
      {
        accessorKey: "priority",
        header: () => (
          <div className="text-center">{getLanguageByKey("Prioritate")}</div>
        ),
        accessorFn: ({ priority }) => priority,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        header: getLanguageByKey("Workflow"),
        accessorKey: "workflow",
        accessorFn: ({ workflow }) => workflow,
        cell: ({ getValue }) => {
          return (
            <div>
              <span
                style={
                  workflowStyles[getValue()] || { backgroundColor: "#ddd" }
                }
                className="lead-workflow-content"
              >
                {getValue()}
              </span>
            </div>
          )
        }
      },
      {
        accessorKey: "contact",
        header: () => (
          <div className="text-center">{getLanguageByKey("Contact")}</div>
        ),
        accessorFn: ({ contact }) => contact,
        cell: ({ getValue }) => (
          <div className="text-center white-space-nowrap">{getValue()}</div>
        )
      },
      {
        accessorKey: "creation_date",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Data de creare")}
          </div>
        ),
        accessorFn: ({ creation_date }) => creation_date,
        cell: ({ getValue }) => (
          <div style={{ width: 150 }} className="text-center">
            {getValue()}
          </div>
        )
      },
      {
        accessorKey: "last_interaction_date",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Ultima interacțiune")}
          </div>
        ),
        accessorFn: ({ last_interaction_date }) => last_interaction_date,
        cell: ({ getValue }) => (
          <div style={{ width: 150 }} className="text-center">
            {getValue()}
          </div>
        )
      },
      {
        accessorKey: "ticket_info.achitat_client",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Achitat client")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.achitat_client),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.avans_euro",
        header: () => (
          <div className="text-center">{getLanguageByKey("Avans în euro")}</div>
        ),
        accessorFn: ({ ticket_info }) => cleanValue(ticket_info?.avans_euro),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.buget",
        header: () => (
          <div className="text-center">{getLanguageByKey("Buget")}</div>
        ),
        accessorFn: ({ ticket_info }) => cleanValue(ticket_info?.buget),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.comision_companie",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Comisionul companiei")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.comision_companie),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.data_avansului",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Data avansului")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.data_avansului),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.data_cererii_de_retur",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Data cererii de retur")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.data_cererii_de_retur),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.data_contractului",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Data contractului")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.data_contractului),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.data_de_plata_integrala",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Data de plată integrală")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.data_de_plata_integrala),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.data_intoarcerii",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Data întoarcerii")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.data_intoarcerii),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.data_plecarii",
        header: () => (
          <div className="text-center">{getLanguageByKey("Data plecării")}</div>
        ),
        accessorFn: ({ ticket_info }) => cleanValue(ticket_info?.data_plecarii),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.tip_de_transport",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Tipul de transport")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.tip_de_transport),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.vacanta",
        header: () => (
          <div className="text-center">{getLanguageByKey("Vacanță")}</div>
        ),
        accessorFn: ({ ticket_info }) => cleanValue(ticket_info?.vacanta),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      },
      {
        accessorKey: "ticket_info.valuta_contului",
        header: () => (
          <div className="text-center">
            {getLanguageByKey("Valuta contului")}
          </div>
        ),
        accessorFn: ({ ticket_info }) =>
          cleanValue(ticket_info?.valuta_contului),
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>
      }
    ]
  }, [selectedTickets, toggleSelectTicket])

  if (loading) {
    return <SpinnerRightBottom />
  }

  return (
    <>
      <Table columns={columns} data={filteredLeads} />

      {/* FIXME: Remove inline style when the layout is fixed */}
      {!!totalLeads && (
        <div style={{ marginBottom: 10 }}>
          <Pagination
            totalPages={totalLeads}
            currentPage={currentPage}
            onPaginationChange={onChangePagination}
          />
        </div>
      )}
    </>
  )
}
