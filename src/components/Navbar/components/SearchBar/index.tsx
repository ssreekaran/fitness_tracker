import React from 'react';
import { FaSearch, FaTimes, FaArrowRight } from 'react-icons/fa';
import { SearchBarProps } from '../../types';
import './styles.css';

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  showSuggestions,
  suggestions,
  onSuggestionClick,
}) => {
  return (
    <div className="search-container">
      <form onSubmit={onSearchSubmit} className="search-form">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={onSearchChange}
            className="search-input"
            aria-label="Search"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search"
              onClick={() => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button type="submit" className="search-submit">
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.path}-${index}`}
              className="search-suggestion"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <div className="suggestion-content">
                <span className="suggestion-title">{suggestion.title}</span>
                <span className="suggestion-path">{suggestion.path}</span>
              </div>
              <FaArrowRight className="suggestion-arrow" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
