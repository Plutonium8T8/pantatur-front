import React from "react"
import "./select.css"
import { translations } from "../utils/translations"

const Select = ({
  options,
  label,
  id,
  value,
  onChange,
  customClassName,
  placeholder,
  required,
  disabled,
  hasError
}) => {
  const handleChange = (event) => {
    const selectedValue = event.target.value
    onChange(selectedValue)
  }

  const language = localStorage.getItem("language") || "RO"

  return (
    <div className={`input-group ${hasError ? "invalid-field" : ""}`}>
      <label htmlFor={id}>{translations[label]?.[language] ?? label}</label>
      <select
        id={id}
        className={`task-select ${hasError ? "invalid-field" : ""}`}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
      >
        <option value="">
          {translations[placeholder]?.[language] ??
            translations[label]?.[language]}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {translations[option]?.[language] ?? option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
