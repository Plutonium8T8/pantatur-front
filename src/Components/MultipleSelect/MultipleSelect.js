import React, { useState, useEffect, useRef } from "react";
import "./CustomMultiSelect.css";

const CustomMultiSelect = ({ options, placeholder = "Выберите...", onChange, selectedValues }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Выбор или удаление опции
    const toggleOption = (option) => {
        const newSelected = selectedValues.includes(option)
            ? selectedValues.filter((item) => item !== option)
            : [...selectedValues, option];

        onChange(newSelected);
    };

    // Удаление конкретного элемента через крестик
    const removeOption = (option) => {
        const newSelected = selectedValues.filter((item) => item !== option);
        onChange(newSelected);
    };

    // Выбрать все / Отменить выбор всех
    const toggleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onChange([]);
        } else {
            onChange(options);
        }
    };

    // Фильтрация списка по поиску
    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="custom-multi-select" ref={dropdownRef}>
            {/* Поле выбора */}
            <div className="select-field-custom" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {selectedValues.length > 0 ? (
                    <div className="selected-options">
                        {selectedValues.map((option) => (
                            <span key={option} className="selected-tag">
                                {option}
                                <span className="remove-option" onClick={(e) => {
                                    e.stopPropagation();
                                    removeOption(option);
                                }}>✖</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="placeholder">{placeholder}</span>
                )}
            </div>

            {/* Выпадающий список */}
            {isDropdownOpen && (
                <div className="dropdown">
                    <input
                        type="text"
                        className="search-input-multi"
                        placeholder="Поиск"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="options-list">
                        {/* Выбрать все */}
                        <div className="option select-all" onClick={toggleSelectAll}>
                            <input type="checkbox" checked={selectedValues.length === options.length} readOnly />
                            <span>Выбрать все</span>
                        </div>

                        {/* Опции */}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div key={option} className="option" onClick={() => toggleOption(option)}>
                                    <input type="checkbox" checked={selectedValues.includes(option)} readOnly />
                                    <span>{option}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-match">Нет совпадений</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomMultiSelect;