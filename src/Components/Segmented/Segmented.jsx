import { useState } from "react"
import "./Segmented.css"

export const Segmented = ({ options, onChange }) => {
  const [selected, setSelected] = useState(options[0].value)

  return (
    <div className="segmented">
      {options.map((option) => (
        <div
          key={option.value}
          onClick={() => {
            onChange?.(option.value)
            setSelected(option.value)
          }}
          className={`segmented-option ${option.value === selected ? "active" : ""}`}
        >
          {option.label}
        </div>
      ))}
    </div>
  )
}
