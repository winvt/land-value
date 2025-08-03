import React, { useState, useEffect, useRef } from 'react';

const AutocompleteDemo = ({ 
  searchQuery, 
  setSearchQuery, 
  autocompleteResults, 
  showAutocomplete, 
  setShowAutocomplete, 
  selectedAutocompleteIndex, 
  setSelectedAutocompleteIndex, 
  handleAutocompleteSelect, 
  handleSearchInputChange, 
  handleSearchInputKeyDown 
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (showAutocomplete && autocompleteResults.length > 0) {
      setSelectedAutocompleteIndex(0);
    }
  }, [autocompleteResults, showAutocomplete]);

  const handleInputChange = (e) => {
    handleSearchInputChange(e);
  };

  const handleKeyDown = (e) => {
    handleSearchInputKeyDown(e);
  };

  const handleItemClick = (suggestion) => {
    handleAutocompleteSelect(suggestion);
  };

  const handleItemMouseEnter = (index) => {
    setSelectedAutocompleteIndex(index);
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for a Bangkok district..."
          className="search-input"
        />
        <button 
          onClick={() => handleAutocompleteSelect({ name: searchQuery })}
          className="search-button"
        >
          <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </button>
      </div>

      {showAutocomplete && autocompleteResults.length > 0 && (
        <div className="autocomplete-dropdown">
          {autocompleteResults.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              className={`autocomplete-item ${index === selectedAutocompleteIndex ? 'selected' : ''}`}
              onClick={() => handleItemClick(suggestion)}
              onMouseEnter={() => handleItemMouseEnter(index)}
            >
              <div className="autocomplete-text">
                <span className="autocomplete-main">{suggestion.name}</span>
                {suggestion.type && (
                  <span className="autocomplete-type">{suggestion.type}</span>
                )}
              </div>
              <div className="autocomplete-description">
                {suggestion.description}
              </div>
              {suggestion.coordinates && (
                <div className="autocomplete-coords">
                  📍 {suggestion.coordinates.lat.toFixed(4)}, {suggestion.coordinates.lng.toFixed(4)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Icon = ({ path, className = "icon" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default AutocompleteDemo; 