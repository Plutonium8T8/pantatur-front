import React from 'react';

import './CheckBox.modules.css';

const CheckBox = ({ name = "", value = false, id, disabled, tgForm = null,tgFormRound = null, onChange = () => { } }) => {
    // console.log(id, value, value === false ? "no" : "yes");

    const onClickHandler = () => {
        onChange({
            id: id,
            value: !value
        });
    }

    return (
        <div className={'custom-checkbox-container'+ (tgForm ? "tg " : "") + (tgFormRound ? "tg-round" : "")}>
            <input
                type="checkbox"
                className={"custom-checkbox " + (tgForm ? "tg " : "") + (tgFormRound ? "tg-round" : "")}
                id={id}
                name={name}
                // value={value === false ? "no" : "yes"} 
                disabled={disabled}
                checked={value}
                onChange={onClickHandler}
            />
            <label
                htmlFor={id}>{name}
            </label>       
        </div>
    );
};

export default CheckBox;