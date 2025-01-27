import React, { useState } from 'react';
import './select.css';

const Select = ({ options, label, id, value, onChange, customClassName }) => {
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        onChange(selectedValue); // Передаем выбранное значение в родительский компонент
    };

    return (
        <div className={`select-container ${customClassName ? customClassName : ''}`}>
            {label && <label htmlFor={id}>{label}</label>}
            <select
                className={`select-field ${customClassName ? `${customClassName}-field` : ''}`}
                id={id}
                value={value} // Используем переданное значение от родителя
                onChange={handleChange}
            >
                <option value="">Select</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;