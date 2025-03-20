import { Pagination as MantinePagination } from "@mantine/core"

export const Pagination = ({ totalPages, currentPage, onPaginationChange }) => {
  return (
    <MantinePagination
      total={totalPages}
      value={currentPage}
      onChange={onPaginationChange}
    />
  )
}
