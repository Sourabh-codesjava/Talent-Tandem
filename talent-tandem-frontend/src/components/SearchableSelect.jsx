import React, { useState, useRef, useEffect } from 'react';
import './SearchableSelect.css';

const SearchableSelect = ({ options, value, onChange, placeholder = 'Search...', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="searchable-select" ref={wrapperRef}>
      {!isOpen ? (
        <div 
          className="searchable-select-trigger"
          onClick={() => !disabled && setIsOpen(true)}
        >
          <span style={{ color: value ? '#1e293b' : '#9ca3af' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="dropdown-arrow">▼</span>
        </div>
      ) : (
        <div className="searchable-select-dropdown-container">
          <input
            type="text"
            className="searchable-select-search-input"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="searchable-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`searchable-select-option ${option.disabled ? 'disabled' : ''} ${option.value === value ? 'selected' : ''}`}
                  onClick={() => !option.disabled && handleSelect(option)}
                >
                  {option.disabled && <span className="check-mark">✓</span>}
                  {option.label}
                </div>
              ))
            ) : (
              <div className="searchable-select-option disabled">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
