import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { cleanValue } from "../utils";
import { api } from "../../../api";
import { workflowStyles } from "../../utils/workflowStyles";
import "./LeadTable.css";
import { SpinnerRightBottom } from "../../SpinnerRightBottom";
import { useAppContext } from "../../../AppContext";
import { MAX_PAGE_SIZE } from "../../../app-constants";
import { Pagination } from "../../Pagination";

const getTotalPages = (items) => {
  return Math.ceil(items / MAX_PAGE_SIZE);
};

const renderTags = (tags) => {
  const isTags = tags.some(Boolean);

  return isTags
    ? tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag.trim()}
        </span>
      ))
    : "—";
};

const LeadTable = ({
  filteredTickets,
  selectedTickets,
  setCurrentTicket,
  toggleSelectTicket,
}) => {
  const [hardTicketsList, setHardTicketsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { tickets } = useAppContext();

  const columns = [
    {
      header: "Verificare",
      accessorFn: ({ id }) => id,
      cell: ({ getValue }) => (
        <div className="lead-checkbox-row">
          <input
            type="checkbox"
            checked={selectedTickets.includes(getValue())}
            onChange={() => toggleSelectTicket(getValue())}
          />
        </div>
      ),
    },
    {
      header: "ID",
      accessorKey: "id",
      accessorFn: ({ id }) => id,
      cell: ({ getValue }) => {
        const id = getValue();
        return (
          <Link to={`/chat/${id}`} className="lead-row-link">
            #{id}
          </Link>
        );
      },
    },
    {
      header: "Nume",
      accessorKey: "name",
      accessorFn: ({ name }) => cleanValue(name),
    },
    {
      header: "Prenume",
      accessorKey: "surname",
      accessorFn: ({ surname }) => cleanValue(surname),
    },
    {
      header: "Email",
      accessorKey: "email",
      accessorFn: ({ email }) => cleanValue(email),
    },
    {
      header: "Telefon",
      accessorKey: "phone",
      accessorFn: ({ phone }) => cleanValue(phone),
    },
    {
      header: "Descriere",
      accessorKey: "description",
      accessorFn: ({ description }) => cleanValue(description),
    },
    {
      header: "Tag-uri",
      accessorKey: "tags",
      accessorFn: ({ tags }) => tags,
      cell: ({ getValue }) => (
        <div className="lead-tags-row">{renderTags(getValue())}</div>
      ),
    },
    {
      header: "Prioritate",
      accessorKey: "priority",
      accessorFn: ({ priority }) => priority,
      cell: ({ getValue }) => (
        <div
          className={`lead-priority-row priority-${getValue()?.toLowerCase() || "default"}`}
        >
          {getValue()}
        </div>
      ),
    },
    {
      header: "Workflow",
      accessorKey: "workflow",
      accessorFn: ({ workflow }) => workflow,
      cell: ({ getValue }) => {
        return (
          <div
            className="lead-workflow-row"
            style={workflowStyles[getValue()] || { backgroundColor: "#ddd" }}
          >
            {getValue()}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: hardTicketsList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    const getHardTickets = async () => {
      setLoading(true);
      try {
        const hardTickets = await api.tickets.getHardList({ page });

        setHardTicketsList(hardTickets.data);
      } catch (_) {
        // TODO: Show Error
      } finally {
        setLoading(false);
      }
    };

    getHardTickets();
  }, [page]);

  if (loading) {
    return <SpinnerRightBottom />;
  }

  return (
    <>
      <table className="lead-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <th key={i}>{header.column.columnDef.header}</th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIXME: Remove inline style when the layout is fixed */}
      <div style={{ marginBottom: 10 }}>
        <Pagination
          totalPages={getTotalPages(tickets.length)}
          currentPage={page}
          onPaginationChange={setPage}
        />
      </div>
    </>
  );
};

export default LeadTable;
