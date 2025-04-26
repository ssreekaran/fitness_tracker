import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const pages = [
  { title: "Home", path: "/" },
  { title: "About", path: "/about" },
  { title: "BMI Calculator", path: "/bmi-calculator" },
  { title: "Body Fat Calculator", path: "/body-fat-calculator" },
  { title: "Food Database", path: "/food-database" },
  { title: "Sign Up", path: "/signup" },
  { title: "Profile", path: "/profile" },
  { title: "Contact Us", path: "/contact" },
  { title: "Weight Loss Calculator", path: "/weight-loss-calculator" },
  { title: "Healthy Food", path: "/healthy-food" },
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  // Filtered suggestions based on query
  const filteredPages = query.trim()
    ? pages.filter(p => p.title.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !(inputRef.current as any).contains(e.target) &&
        suggestionRef.current &&
        !(suggestionRef.current as any).contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredPages.length > 0) {
      navigate(filteredPages[0].path);
    } else if (query.trim()) {
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(googleUrl, "_blank");
    }
    setShowSuggestions(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (path: string) => {
    navigate(path);
    setShowSuggestions(false);
    setQuery("");
  };

  const handleGoogleClick = () => {
    const googleUrl = `https://www.google.com/search?q=site:${window.location.hostname}+${encodeURIComponent(query)}`;
    window.open(googleUrl, "_blank");
    setShowSuggestions(false);
  };

  return (
    <div className="header-search-bar" style={{ position: "relative", width: "340px" }}>
      <form className="d-flex" onSubmit={handleSubmit} autoComplete="off" style={{ width: "100%" }}>
        <input
          type="text"
          className="form-control me-2"
          value={query}
          onChange={handleInput}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search pages..."
          ref={inputRef}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          Search
        </button>
      </form>
      {showSuggestions && query.trim() && (
        <div
          ref={suggestionRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            zIndex: 1000,
            borderRadius: "0 0 6px 6px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            maxHeight: 240,
            overflowY: "auto"
          }}
        >
          {filteredPages.length > 0 ? (
            filteredPages.map(page => (
              <div
                key={page.path}
                onClick={() => handleSuggestionClick(page.path)}
                className="search-suggestion"
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  fontWeight: 500,
                  color: "#2d3a4a"
                }}
                onMouseDown={e => e.preventDefault()} // Prevents input blur
              >
                {page.title}
              </div>
            ))
          ) : (
            <div
              onClick={handleGoogleClick}
              className="search-suggestion"
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: "#4285f4",
                fontWeight: 500
              }}
              onMouseDown={e => e.preventDefault()} // Prevents input blur
            >
              Search "{query}" on Google
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
