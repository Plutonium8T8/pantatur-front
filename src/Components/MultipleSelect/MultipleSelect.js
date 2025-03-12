import React, { useState, useEffect, useRef } from "react"
import { IoMdClose } from "react-icons/io"
import "./CustomMultiSelect.css"
import { Spin } from "../Spin"
import { Input } from "../Input"

import { getLanguageByKey } from "../utils/getLanguageByKey"

const CustomMultiSelect = ({
  options = [],
  placeholder = getLanguageByKey("Select..."),
  onChange,
  selectedValues = [],
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleOption = (option) => {
    const newSelected = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option]

    onChange(newSelected)
  }

  const removeOption = (option) => {
    const newSelected = selectedValues.filter((item) => item !== option)
    onChange(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([])
    } else {
      onChange(options)
    }
  }

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // TODO: Display error messages
  const renderSelectContent = () => {
    if (loading) {
      return null
    }

    if (filteredOptions.length > 0) {
      return (
        <>
          <div className="option select-all" onClick={toggleSelectAll}>
            <input
              type="checkbox"
              checked={selectedValues.length === options.length}
              readOnly
            />
            <span>{getLanguageByKey("Selectează toate")}</span>
          </div>
          {filteredOptions.map((option) => (
            <div
              key={option}
              className="option"
              onClick={() => toggleOption(option)}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                readOnly
              />
              <span>{option}</span>
            </div>
          ))}
        </>
      )
    }

    return (
      <div className="no-match">{getLanguageByKey("Nu există potriviri")}</div>
    )
  }

  return (
    <div className="custom-multi-select" ref={dropdownRef}>
      <div
        className="select-field-custom"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedValues.length > 0 ? (
          <div className="selected-options">
            {selectedValues.map((option) => (
              <span key={option} className="selected-tag">
                {option}
                <span
                  className="remove-option"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeOption(option)
                  }}
                >
                  <IoMdClose />
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}

        {loading && <Spin width={10} height={10} stroke={2} />}
      </div>

      {isDropdownOpen && (
        <div className="dropdown">
          <Input
            placeholder={getLanguageByKey("Căutare")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="options-list">{renderSelectContent()}</div>
        </div>
      )}
    </div>
  )
}

export default CustomMultiSelect
