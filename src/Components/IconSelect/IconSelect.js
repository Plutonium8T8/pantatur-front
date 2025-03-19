import React from "react"
import { Select } from "@mantine/core"
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
  const language = localStorage.getItem("language") || "RO"

  return (
    <div className={`input-group-icon ${hasError ? "invalid-field" : ""}`}>
      <label htmlFor={id}>{translations[label]?.[language] ?? label}</label>

      <Select
        id={id}
        data={options.map((option) => ({
          value: option.name,
          label: translations[option.name]?.[language] ?? option.name,
          icon: option.icon
        }))}
        value={value}
        onChange={onChange}
        placeholder={translations[placeholder]?.[language] ?? placeholder}
        required={required}
        disabled={disabled}
        itemComponent={CustomItem}
        searchable
        clearable
        error={
          hasError
            ? (translations["error_field"]?.[language] ?? "Ошибка")
            : undefined
        }
      />
    </div>
  )
}

const CustomItem = ({ label, icon, ...others }) => (
  <div
    {...others}
    style={{ display: "flex", alignItems: "center", gap: "8px" }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </div>
)

export default IconSelect
