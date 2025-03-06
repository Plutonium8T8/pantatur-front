import { HeaderCell } from "./HeaderCell"
import { RowCell } from "./RowCell"
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table"
import "./Table.css"
import { Empty } from "../Empty"

export const Table = ({ data, columns, loading }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <HeaderCell key={i}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </HeaderCell>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <RowCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </RowCell>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && !table.getRowModel().rows.length && <Empty />}
    </>
  )
}
