import { IoMdClose } from "react-icons/io"
import "./Input.css"

export const Input = ({
  value,
  onChange,
  placeholder,
  className,
  clear,
  type = "text",
  isError,
  ...props
}) => {
  const classNames = ["input", isError ? "error" : false, className]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="input-container">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={classNames}
        {...props}
      />

      {clear && (
        <div onClick={() => onChange("")} className="clear">
          <IoMdClose />
        </div>
      )}
    </div>
  )
}
