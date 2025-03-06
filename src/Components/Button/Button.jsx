import "./Button.css"

const variants = {
  danger: "danger",
  warning: "warning",
  primary: "primary",
  default: "default"
}

export const Button = ({
  children,
  onClick,
  className,
  variant = "default",
  loading,
  ...props
}) => {
  const classNames = ["btn", variants[variant], className]
    .filter(Boolean)
    .join(" ")

  return (
    <button
      disabled={loading}
      className={classNames}
      onClick={onClick}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  )
}
