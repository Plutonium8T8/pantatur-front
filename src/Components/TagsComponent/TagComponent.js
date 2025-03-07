import React, { useState, useEffect } from "react"
import { FaTrash } from "react-icons/fa"
import { translations } from "../utils/translations"
import { Input } from "../Input"

const TagInput = ({ initialTags = [], onChange }) => {
  const language = localStorage.getItem("language") || "RO"

  const [tags, setTags] = useState(
    Array.isArray(initialTags)
      ? initialTags.filter((tag) => tag.trim() !== "")
      : []
  )
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState([])

  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const savedSuggestions = localStorage.getItem("tagsSuggestions")
    if (savedSuggestions) {
      setSuggestions(JSON.parse(savedSuggestions))
    } else {
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("tagsSuggestions", JSON.stringify(suggestions))
  }, [suggestions])

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)

    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredSuggestions(filtered)
    setShowSuggestions(true)
  }

  const handleFocus = () => {
    setFilteredSuggestions(suggestions)
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleAddTag = (tag) => {
    if (tag.trim() && !tags.includes(tag)) {
      const updatedTags = [...tags, tag]
      setTags(updatedTags)
      onChange(updatedTags)
    }
    setInputValue("")
    setShowSuggestions(false)
  }

  const handleSaveTag = () => {
    if (inputValue.trim() && !suggestions.includes(inputValue)) {
      const updatedSuggestions = [...suggestions, inputValue]
      setSuggestions(updatedSuggestions)
    }
    setInputValue("")
    setShowSuggestions(false)
  }

  const handleRemoveTag = (tag) => {
    const updatedTags = tags.filter((t) => t !== tag)
    setTags(updatedTags)
    onChange(updatedTags)
  }

  return (
    <div className="tag-input-container">
      <div className="tags-display">
        {tags.length === 0 && (
          <div>{translations["Nici un tag selectat"][language]}</div>
        )}
        {tags.map((tag) => (
          <div key={tag} className="tag-item">
            <div className="tag-text">{tag}</div>
            <button
              className="remove-tag-button"
              onClick={() => handleRemoveTag(tag)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <div className="input-group">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={translations["Introduce tag"][language]}
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
      </div>
      <div className="button-container">
        <button onClick={handleSaveTag} className="submit-button">
          {translations["Adaugă tag"][language]}
        </button>
        <button
          onClick={() => {
            if (inputValue.trim()) handleAddTag(inputValue)
          }}
          className="submit-button"
        >
          {translations["Salvează tag"][language]}
        </button>
      </div>
    </div>
  )
}

export default TagInput
