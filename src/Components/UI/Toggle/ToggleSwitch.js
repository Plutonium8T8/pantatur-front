import React from "react";


import "./ToggleSwitch.css";


const ToggleSwitch = ({name = "", value = false, id, disabled, colorGreen = null, onChange = () => { } }) => {
    // console.log(id, value, value === false ? "no" : "yes");

    return (
        <label className="label_switch"> 
            <div className="label_switch_text">{name}</div>
                <label className="switch">
                    <input
                    type="checkbox"
                    className={"switch_input"}
                    id={id}
                    name={name}
                    // value={value === false ? "no" : "yes"} 
                    disabled={disabled}
                    checked={value}
                    onChange={onChange}
                    /> 
                        <span
                                className={"switch_slider " + (colorGreen ? "" : "") + (colorGreen ? "colorGreen" : "")}>
                                
                        </span>
                </label >
        </label>
    );
};
export default ToggleSwitch;