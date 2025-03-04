import React from "react"
import "./ToggleSwitch.css"
import { Switch } from "../Switch"

const ToggleSwitch = ({ label, checked = false, onChange, className = "" }) => {
  return (
    <div className="toggle-container">
      {label && <span className="toggle-label">{label}</span>}
      <label className={`toggle-switch ${className}`}>
        <Switch checked={checked} onChange={onChange} />
      </label>
    </div>
  )
}

export default ToggleSwitch
