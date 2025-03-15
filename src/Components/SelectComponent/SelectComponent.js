import React from "react"
import "./select.css"
import { translations } from "../utils/translations"
import { IoMdClose, IoIosArrowDown } from "react-icons/io"

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
  hasError,
  clear
}) => {
  const handleChange = (event) => {
    const selectedValue = event.target.value
    onChange(selectedValue)
  }

  const language = localStorage.getItem("language") || "RO"

  return (
    <div className={`input-group ${hasError ? "invalid-field" : ""}`}>
      {label && (
        <label htmlFor={id}>{translations[label]?.[language] ?? label}</label>
      )}
      <div className="select-container-wrapper">
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

        <div className={`right-icon ${clear ? "hide-arrow-down-icon" : ""}`}>
          <IoIosArrowDown size={16} />
        </div>
        {clear && (
          <div
            className="right-icon hide-close-icon"
            onClick={() => onChange("")}
          >
            <IoMdClose size={16} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Select
