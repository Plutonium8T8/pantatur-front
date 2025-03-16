import { Pagination } from "../Pagination"
import Table from "rc-table"
import "./RcTable.css"

export const RcTable = ({
  columns,
  data,
  pagination,
  bordered,
  selectedRow,
  ...props
}) => {
  const { position, ...restPagination } = pagination
  return (
    <div>
      <Table
        className="table"
        tableLayout="fixed"
        rowClassName={({ id }) =>
          `${bordered ? "border" : ""} ${selectedRow.includes(Number(id)) ? "row-selection" : ""}`
        }
        columns={columns}
        data={data}
        scroll={{ x: "100%" }}
        {...props}
      />
      {!!pagination && (
        <div className={`d-flex justify-content-${position}`}>
          <Pagination {...restPagination} />
        </div>
      )}
    </div>
  )
}
