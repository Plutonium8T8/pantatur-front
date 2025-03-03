import React from "react";
import "./ToggleSwitch.css";

const ToggleSwitch = ({ label, checked = false, onChange, className = "" }) => {
    return (
        <div className="toggle-container">
            {label && <span className="toggle-label">{label}</span>}
            <label className={`toggle-switch ${className}`}>
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span className="slider round"></span>
            </label>
        </div>
    );
};

export default ToggleSwitch;