import React from "react"
import { Select as MantineSelect } from "@mantine/core"
import { translations } from "../utils/translations"
import { IoMdClose } from "react-icons/io"

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
  const language = localStorage.getItem("language") || "RO"

  return (
    <div className={`input-group ${hasError ? "invalid-field" : ""}`}>
      {label && (
        <label htmlFor={id}>{translations[label]?.[language] ?? label}</label>
      )}
      <div className="select-container-wrapper">
        <MantineSelect
          id={id}
          className={`task-select ${hasError ? "invalid-field" : ""}`}
          value={value}
          onChange={onChange}
          data={options.map((option) => ({
            value: option,
            label: translations[option]?.[language] ?? option
          }))}
          required={required}
          disabled={disabled}
          placeholder={
            translations[placeholder]?.[language] ??
            translations[label]?.[language]
          }
          rightSection={
            clear ? (
              <IoMdClose size={16} onClick={() => onChange("")} />
            ) : undefined
          }
          error={hasError}
          searchable
        />
      </div>
    </div>
  )
}

export default Select
