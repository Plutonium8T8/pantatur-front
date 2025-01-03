import React, { useState } from 'react';
import './TagInput.css';

const TagInput = () => {
  const [tags, setTags] = useState([]);
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
    setFilteredSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200); // Задержка для клика на элемент
  };

  const handleAddTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleSaveTag = () => {
    if (inputValue && !suggestions.includes(inputValue)) {
      setSuggestions([...suggestions, inputValue]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      handleAddTag(inputValue);
    }
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
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
        <button onClick={() => handleAddTag(inputValue)} className="add-tag-button">
          Добавить тэг
        </button>
      </div>
    </div>
  );
};

export default TagInput;