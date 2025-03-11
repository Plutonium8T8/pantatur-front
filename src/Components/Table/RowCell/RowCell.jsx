import "./RowCell.css"

export const RowCell = ({ children, ...props }) => {
  return (
    <td className="table-cell" {...props}>
      {children}
    </td>
  )
}
