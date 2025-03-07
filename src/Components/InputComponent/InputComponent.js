import React from "react"
import "./InputComponent.css"
import { translations } from "../utils/translations"
import { Input as BaseInput } from "../Input"

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  placeholder = "",
  id,
  disabled = false
}) => {
  const language = localStorage.getItem("language") || "RO"

  return (
    <div className="input-group">
      <label htmlFor={id}>{translations?.[label]?.[language] ?? label}</label>
      <BaseInput
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={className}
        placeholder={translations?.[placeholder]?.[language] ?? placeholder}
        disabled={disabled}
      />
    </div>
  )
}

export default Input
