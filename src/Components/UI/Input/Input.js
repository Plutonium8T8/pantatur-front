import React, { useState } from 'react';

import './Input.modules.css';

const Input = ({
    id = '',
    name = '',
    placeholder = "",
    disabled = false,
    readOnly = false,
    required = false,
    error = false,
    errorText = null,
    descriptionText = null,
    autofocus = null,
    value = '',
    type="text",
    onChange = () => { },
    onBlur = () => { },
    tgForm = null}
) => {

    return (
        <div className="text-field">
            {name && name.length > 0 &&
                <div
                    className="text-field__label"
                >
                    <label
                        htmlFor={id}
                    >
                        {name}:
                    </label>
                    {required &&
                        <div className="text-field__label-required">*</div>
                    }
                </div>
            }

            <input
                className={"text-field__input " + (tgForm ? "tg " : "") + ((error || errorText) ? "text-field__input-error" : '')}
                type={type}
                name={id}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                readOnly={readOnly}
                autoFocus={autofocus}
                onBlur={onBlur}
            />
            {(errorText) &&
                <div className='text-field__error-text'>{errorText}</div>
            }
            {descriptionText &&
                <div className='text-field__description-text'>{descriptionText}</div>
            }
        </div>
    );
};

export default Input;