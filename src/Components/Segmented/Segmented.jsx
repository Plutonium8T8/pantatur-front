import { useState } from "react"
import "./Segmented.css"

export const Segmented = ({ options, onChange, defaultValue }) => {
  const [selected, setSelected] = useState(defaultValue || options[0].value)

  return (
    <div className="segmented">
      {options.map((option) => (
        <div
          key={option.value}
          onClick={() => {
            onChange?.(option.value)
            setSelected(option.value)
          }}
          className={`segmented-option ${option.value === selected ? "active" : ""} ${option.disabled ? "disabled" : ""}`}
        >
          {option.label}
        </div>
      ))}
    </div>
  )
}
