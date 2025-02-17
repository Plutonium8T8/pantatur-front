import React, { useState, useEffect, useRef } from "react";
import "./CustomMultiSelect.css";

const CustomMultiSelect = ({ options, selectedValues = [], onChange, placeholder = "Select..." }) => {
    const [selectedOptions, setSelectedOptions] = useState(selectedValues);
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
        let newSelectedOptions;
        if (selectedOptions.includes(option)) {
            newSelectedOptions = selectedOptions.filter((item) => item !== option);
        } else {
            newSelectedOptions = [...selectedOptions, option];
        }

        setSelectedOptions(newSelectedOptions);
        console.log("🔹 Выбраны workflow в MultiSelect:", newSelectedOptions);
        onChange(newSelectedOptions); // 🔥 Передаем выбранные workflow обратно
    };

    // Выбрать все / Отменить выбор всех
    const toggleSelectAll = () => {
        const newSelectedOptions = selectedOptions.length === options.length ? [] : options;
        setSelectedOptions(newSelectedOptions);
        console.log("🔹 Выбраны все workflow:", newSelectedOptions);
        onChange(newSelectedOptions); // 🔥 Передаем в родительский компонент
    };

    // Фильтрация списка по поиску
    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="custom-multi-select" ref={dropdownRef}>
            {/* Поле выбора */}
            <div className="select-field-custom" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {selectedOptions.length > 0 ? (
                    <div className="selected-options">
                        {selectedOptions.length === options.length ? (
                            <span className="selected-tag">All Selected</span>
                        ) : (
                            selectedOptions.map((option) => (
                                <span key={option} className="selected-tag">
                                    {option}
                                </span>
                            ))
                        )}
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
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="options-list">
                        {/* Выбрать все */}
                        <div className="option select-all" onClick={toggleSelectAll}>
                            <input type="checkbox" checked={selectedOptions.length === options.length} readOnly />
                            <span>Select All</span>
                        </div>

                        {/* Опции */}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div key={option} className="option" onClick={() => toggleOption(option)}>
                                    <input type="checkbox" checked={selectedOptions.includes(option)} readOnly />
                                    <span>{option}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-match">No matches</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomMultiSelect;