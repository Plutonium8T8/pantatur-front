import "./Tag.css"

const variants = {
  success: "success",
  processing: "processing"
}

export const Tag = ({ children, type }) => {
  return (
    <span
      className={`tag-standalone tag-standalone-${variants[type] || "default"}`}
    >
      {children}
    </span>
  )
}
