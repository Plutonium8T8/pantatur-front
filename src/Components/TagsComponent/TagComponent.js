import React, { useState, useEffect } from 'react';
import './TagInput.css';

const TagInput = ({ initialTags = [], onChange }) => {
    const [tags, setTags] = useState(
        Array.isArray(initialTags) ? initialTags.filter((tag) => tag.trim() !== '') : []
    ); // Фильтруем пустые теги
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Загрузка сохраненных тегов из localStorage при монтировании
    useEffect(() => {
        const savedSuggestions = localStorage.getItem('tagsSuggestions');
        if (savedSuggestions) {
            setSuggestions(JSON.parse(savedSuggestions));
        } else {
            setSuggestions(['Tag1', 'Tag2', 'Tag3']); // Начальные теги по умолчанию
        }
    }, []);

    // Сохранение тегов в localStorage при их обновлении
    useEffect(() => {
        localStorage.setItem('tagsSuggestions', JSON.stringify(suggestions));
    }, [suggestions]);

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
        if (tag.trim() && !tags.includes(tag)) {
            const updatedTags = [...tags, tag];
            setTags(updatedTags);
            onChange(updatedTags); // Передаем обновленный массив тегов
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleSaveTag = () => {
        if (inputValue.trim() && !suggestions.includes(inputValue)) {
            const updatedSuggestions = [...suggestions, inputValue];
            setSuggestions(updatedSuggestions); // Сохраняем новый тег в список доступных
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
                            x
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
                placeholder="Introduce tag..."
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
                    Salveaza tag
                </button>
                <button
                    onClick={() => {
                        if (inputValue.trim()) handleAddTag(inputValue);
                    }}
                    className="add-tag-button"
                >
                    Adauga tag
                </button>
            </div>
        </div>
    );
};

export default TagInput;