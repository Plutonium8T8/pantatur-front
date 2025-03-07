import React from "react"
import "./LabelInput.css"
import { Input } from "../Input"
import { getLanguageByKey } from "../utils/getLanguageByKey"

export const LabelInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  id,
  disabled = false,
  error
}) => {
  return (
    <div className="input-label | mb-16">
      <div className="input-label">
        {label && (
          <div className="mb-8">
            <label htmlFor={id}>{getLanguageByKey(label) ?? label}</label>
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={getLanguageByKey(label) ?? placeholder}
          disabled={disabled}
          isError={!!error}
        />
      </div>
      {error && <span className="input-label-error">{error}</span>}
    </div>
  )
}
