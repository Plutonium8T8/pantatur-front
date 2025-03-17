import React, { useState } from "react"
import "./IconSelect.css"
import { translations } from "../utils/translations"

const IconSelect = ({
  options,
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  hasError
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const language = localStorage.getItem("language") || "RO"

  const handleSelect = (selectedValue) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  return (
    <div className={`input-group-icon ${hasError ? "invalid-field" : ""} mb-16`}>
      <label htmlFor={id}>{translations[label]?.[language] ?? label}</label>
      <div className="custom-select-wrapper">
        <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
          <span className="task-icon">
            {options.find((option) => option.name === value)?.icon}
          </span>
          <span className="task-text">{value || placeholder}</span>
        </div>

        {isOpen && (
          <ul className="custom-dropdown">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option.name)}
                className="custom-dropdown-item"
              >
                {option.icon}{" "}
                <span className="task-text">
                  {translations[option.name]?.[language] ?? option.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default IconSelect
