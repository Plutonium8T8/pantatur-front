import "./Button.css";

const variants = {
  danger: "danger",
  warning: "warning",
  default: "default",
};

export const Button = ({
  children,
  onClick,
  className,
  variant = "default",
}) => {
  return (
    <button className={`${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};