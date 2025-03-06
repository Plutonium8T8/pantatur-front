import { IoMdClose } from "react-icons/io"
import "./Input.css"

export const Input = ({
  value,
  onChange,
  placeholder,
  className,
  clear,
  ...props
}) => {
  const classNames = ["input", className].filter(Boolean).join(" ")

  return (
    <div className="input">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
