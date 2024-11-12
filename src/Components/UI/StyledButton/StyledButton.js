import React, { } from 'react';
import { Icon } from '../';

import './StyledButton.css';

//primary - основной стиль
//secondary - дополнительный стиль
//danger - опасное действие

const StyledButton = ({ children, className = null, onClickHandler = () => { }, name, style = 'primary' }) => {
    return (
        <div
            onClick={onClickHandler}
            className={'styled-button ' + style + " " + (className ? className : "")}
        >
            {name ? name : children}
        </div>
    );
};

export default StyledButton;

const Button = ({ name = "", onClick = null, className, leftIconName = null, type = "primary", busy = false, disabled = false, tgFormBlue = false, tgFormWhite = false, tgFormGray = false, tgFormActive = false, style = {} }) => {
    return (

        <div className={'_button ' + (className ? (" " + className + " ") : "") 
         + (disabled ? 'disabled' : type)
         + (busy ? " busy" : "")
         + (tgFormBlue ? "tgb " : "")
         + (tgFormWhite ? "tgw " : "")
         + (tgFormGray ? "tgg " : "")
         + (tgFormActive ? "tga " : "")} 
            style={{ ...style }}
            onClick={onClick ? ((busy || disabled) ? () => { } : onClick) : () => { }}>
            {leftIconName &&
                <Icon name={leftIconName} />
            }
            <div>{name}</div>
            {busy &&
                <div className="_button-busy" />
            }
        </div>
    );
};

export {
    Button
};