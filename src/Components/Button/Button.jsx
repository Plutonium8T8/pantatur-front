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
  return (
    <button
      disabled={loading}
      className={`btn ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  )
}
