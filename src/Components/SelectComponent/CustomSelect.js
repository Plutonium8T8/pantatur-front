import React from "react";
import Select from "react-select";

// Универсальный компонент
const CustomSelect = ({ options, value, onChange, customStyles, placeholder }) => {
  // Базовые стили, которые можно дополнить
  const defaultStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? options.find((opt) => opt.value === state.data.value)?.backgroundColor || '#f0f0f0'
        : options.find((opt) => opt.value === state.data.value)?.backgroundColor || '#fff',
      color: '#000',
      cursor: 'pointer',
      padding: '10px',
    }),
    control: (provided) => ({
      ...provided,
      borderColor: '#ccc',
      boxShadow: 'none',
      '&:hover': { borderColor: '#aaa' },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#000',
    }),
  };

  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value === value)}
      onChange={onChange}
      styles={customStyles || defaultStyles}
      placeholder={placeholder || "Выберите..."}
      isSearchable={false} // Убираем поиск по умолчанию
    />
  );
};

export default CustomSelect;