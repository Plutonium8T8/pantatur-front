import React, { useState } from 'react';
import './TagInput.css';

const TagInput = ({ initialTags = [], onChange }) => {
    const [tags, setTags] = useState(Array.isArray(initialTags) ? initialTags : []);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState(['Tag1', 'Tag2', 'Tag3']);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        const filtered = suggestions.filter((suggestion) =>
            suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
    };

    const handleFocus = () => {
        setFilteredSuggestions(suggestions); // Показываем весь список при фокусе
        setShowSuggestions(true);
    };

    const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200); // Задержка для клика на элемент
    };

    const handleAddTag = (tag) => {
        if (!tags.includes(tag)) {
            const updatedTags = [...tags, tag];
            setTags(updatedTags);
            onChange(updatedTags); // Передаем обновленный массив тегов
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleSaveTag = () => {
        if (inputValue && !suggestions.includes(inputValue)) {
            setSuggestions([...suggestions, inputValue]); // Сохраняем новый тег в список доступных
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleRemoveTag = (tag) => {
        const updatedTags = tags.filter((t) => t !== tag);
        setTags(updatedTags);
        onChange(updatedTags); // Передаем обновленный массив тегов
    };

    return (
        <div className="tag-input-container">
            <div className="tags-container">
                {tags.map((tag) => (
                    <div key={tag} className="tag-item">
                        {tag}
                        <button className="remove-tag-button" onClick={() => handleRemoveTag(tag)}>
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleFocus} // Показываем список тегов при фокусе
                onBlur={handleBlur} // Скрываем список при потере фокуса
                placeholder="Введите тэг..."
                className="tag-input"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="suggestions-list">
                    {filteredSuggestions.map((suggestion) => (
                        <li
                            key={suggestion}
                            onClick={() => handleAddTag(suggestion)}
                            className="suggestion-item"
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
            <div className="tag-buttons-container">
                <button onClick={handleSaveTag} className="save-tag-button">
                    Сохранить тэг
                </button>
                <button
                    onClick={() => {
                        if (inputValue.trim()) handleAddTag(inputValue);
                    }}
                    className="add-tag-button"
                >
                    Добавить тэг
                </button>
            </div>
        </div>
    );
};

export default TagInput;