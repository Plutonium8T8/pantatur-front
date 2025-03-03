import "./Button.css";

const variants = {
  danger: "danger",
  warning: "warning",
  primary: "primary",
  default: "default",
};

export const Button = ({
  children,
  onClick,
  className,
  variant = "default",
}) => {
  return (
    <button className={`btn ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
