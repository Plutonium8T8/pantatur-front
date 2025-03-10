import React from "react"
import { IoMdClose } from "react-icons/io"
import "./LabelInput.css"
import { getLanguageByKey } from "../utils/getLanguageByKey"

export const LabelInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  id,
  disabled = false,
  error,
  clear,
  className,
  ...props
}) => {
  const classNames = ["input", error ? "error" : false, className]
    .filter(Boolean)
    .join(" ")
  return (
    <div>
      {label && (
        <div className="mb-8">
          <label htmlFor={id}>{getLanguageByKey(label) ?? label}</label>
        </div>
      )}
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
      {error && <span className="input-label-error">{error}</span>}
    </div>
  )
}
