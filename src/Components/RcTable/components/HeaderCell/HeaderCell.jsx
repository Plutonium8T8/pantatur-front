import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io"
import "./HeaderCell.css"

export const HeaderCellRcTable = ({ title, sortable, asc }) => {
  return (
    <div className="d-flex align-items-center justify-content-center pointer gap-8 | table-thead-sort">
      <div>{title}</div>

      {sortable && (
        <div className="d-flex">
          {asc ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
        </div>
      )}
    </div>
  )
}
