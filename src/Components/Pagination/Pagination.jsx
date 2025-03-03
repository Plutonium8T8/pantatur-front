import "./Pagination.css";

export const Pagination = ({ totalPages, currentPage, onPaginationChange }) => {
  const listPages = Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i}
      className={currentPage === i + 1 ? "active" : ""}
      onClick={() => onPaginationChange(i + 1)}
    >
      {i + 1}
    </button>
  ));

  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPaginationChange(currentPage - 1)}
      >
        {"<"}
      </button>

      {listPages}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPaginationChange(currentPage + 1)}
      >
        {">"}
      </button>
    </div>
  );
};
