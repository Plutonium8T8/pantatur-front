import React, { useState } from 'react';
import './select.css';
import { translations } from '../utils/translations';

const Select = ({ options, label, id, value, onChange, customClassName }) => {
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        onChange(selectedValue); // Передаем выбранное значение в родительский компонент
    };

    const language = localStorage.getItem('language') || 'RO';

    return (
        <div className="input-group">
            <label htmlFor={id}>{translations[label][language] ?? label}</label>
            <select
                id={id}
                className="task-select"
                value={value}
                onChange={handleChange}
                required
            >
                <option value={value}>
                    {options.length === 0 ? translations['Încărcăm...'][language] : translations[label][language] ?? label}
                </option>
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