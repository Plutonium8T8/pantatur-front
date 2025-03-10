import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft
} from "react-icons/md"
import "./Pagination.css"
import { Button } from "../Button"

export const Pagination = ({ totalPages, currentPage, onPaginationChange }) => {
  const listPages = Array.from({ length: totalPages }, (_, i) => (
    <Button
      key={i}
      variant={currentPage === i + 1 ? "primary" : "default"}
      onClick={() => onPaginationChange(i + 1)}
    >
      {i + 1}
    </Button>
  ))

  return (
    <div className="pagination">
      <Button
        disabled={currentPage === 1}
        onClick={() => onPaginationChange(currentPage - 1)}
      >
        <MdOutlineKeyboardArrowLeft />
      </Button>

      {listPages}

      <Button
        disabled={currentPage === totalPages}
        onClick={() => onPaginationChange(currentPage + 1)}
      >
        <MdOutlineKeyboardArrowRight />
      </Button>
    </div>
  )
}
