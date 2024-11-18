import React from 'react';
import './InputComponent.css';


const Input = ({
    label,         // Текст метки
    type = 'text', // Тип поля ввода (по умолчанию 'text')
    value,         // Текущее значение
    onChange,      // Функция-обработчик изменения
    className = '',// Дополнительные классы для стилизации
    placeholder = '', // Подсказка внутри поля
    id,            // Уникальный идентификатор
}) => {
    return (
        <label htmlFor={id} className="input-label">
            <div>{label}</div>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className={`input-field ${className}`}
                placeholder={placeholder}
            />
        </label>
    );
};

export default Input;
