// import React from 'react';
// import './InputComponent.css';
// import { translations } from '../utils/translations';

// const Input = ({
//     label,         // Текст метки
//     type = 'text', // Тип поля ввода (по умолчанию 'text')
//     value,         // Текущее значение
//     onChange,      // Функция-обработчик изменения
//     className = '',// Дополнительные классы для стилизации
//     placeholder = '', // Подсказка внутри поля
//     id,            // Уникальный идентификатор
// }) => {
//     const language = localStorage.getItem('language') || 'RO';

//     return (
//         <div className="input-group">
//             <label htmlFor={id}>{translations[label][language] ?? label}</label>
//             <input
//                 id={id}
//                 type={type}
//                 value={value}
//                 onChange={onChange}
//                 className={className}
//                 placeholder={translations[placeholder]?.[language] ?? placeholder}
//             />
//         </div>
//     );
// };

// export default Input;


import React from 'react';
import './InputComponent.css';
import { translations } from '../utils/translations';

const Input = ({
    label,         // Текст метки
    type = 'text', // Тип поля ввода (по умолчанию 'text')
    value,         // Текущее значение
    onChange,      // Функция-обработчик изменения
    className = '',// Дополнительные классы для стилизации
    placeholder = '', // Подсказка внутри поля
    id,            // Уникальный идентификатор
}) => {
    const language = localStorage.getItem('language') || 'RO';

    return (
        <div className="input-group">
            <label htmlFor={id}>
                {translations?.[label]?.[language] ?? label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className={className}
                placeholder={translations?.[placeholder]?.[language] ?? placeholder}
            />
        </div>
    );
};

export default Input;