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
  ...props
}) => {
  return (
    <button
      className={`btn ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
