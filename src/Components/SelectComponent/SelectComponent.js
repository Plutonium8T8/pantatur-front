import React, { useState } from 'react';
import './select.css';

const Select = ({ options, label, id, value, onChange }) => {
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        onChange(selectedValue); // Передаем выбранное значение в родительский компонент
    };

    return (
        <div className='select-container'>
            {label && <label htmlFor={id}>{label}</label>}
            <select
                className='select-field'
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