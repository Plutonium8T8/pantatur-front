import "./TextEllipsis.css"

export const TextEllipsis = ({ rows = 1, children }) => {
  return (
    <p style={{ "--rows": rows }} className="ellipsis">
      {children}
    </p>
  )
}
