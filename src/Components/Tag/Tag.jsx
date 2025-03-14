import "./Tag.css"

const variants = {
  success: "success",
  processing: "processing",
  warning: "warning"
}

export const Tag = ({ children, type, ...props }) => {
  return (
    <span
      className={`tag-standalone tag-standalone-${variants[type] || "default"}`}
      {...props}
    >
      {children}
    </span>
  )
}
