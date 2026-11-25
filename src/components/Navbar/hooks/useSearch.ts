import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// List of available pages for search suggestions
const AVAILABLE_PAGES = [
  { title: "Food Database", path: "/food-database" },
  { title: "Healthy Food", path: "/healthy-food" },
  { title: "BMI Calculator", path: "/bmi-calculator" },
  { title: "Body Fat Calculator", path: "/body-fat-calculator" },
  { title: "Weight Loss Calculator", path: "/weight-loss-calculator" },
  { title: "TDEE Calculator", path: "/tdee-calculator" },
  { title: "Macro Calculator", path: "/macro-calculator" },
  { title: "One Rep Max Calculator", path: "/one-rep-max-calculator" },
  { title: "Heart Rate Zone Calculator", path: "/heart-rate-zone-calculator" },
  { title: "About", path: "/about" },
  { title: "Contact Us", path: "/contact" },
  { title: "Personal Fitness", path: "/personal-fitness" },
  { title: "Calorie Tracker", path: "/calorie-tracker" },
  { title: "Workout Planner", path: "/workout-planner" },
  { title: "Profile", path: "/profile" },
  { title: "Settings", path: "/settings" },
  { title: "Terms of Service", path: "/legal/terms-of-service" },
  { title: "Privacy Policy", path: "/legal/privacy-policy" },
];

const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { title: string; path: string }[]
  >([]);
  const navigate = useNavigate();

  // Get suggestions based on search query
  const getSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    return AVAILABLE_PAGES.filter((page) =>
      page.title.toLowerCase().includes(queryLower)
    );
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSuggestions(true);
      const results = getSuggestions(searchQuery);
      setSuggestions(results);
      setNoResults(results.length === 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setNoResults(false);
    }
  }, [searchQuery, getSuggestions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check if the query matches any page title exactly (case insensitive)
    const exactMatch = AVAILABLE_PAGES.find(
      (page) => page.title.toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      // Navigate to the matching page
      navigate(exactMatch.path);
      setShowSuggestions(false);
      setNoResults(false);
      return;
    }

    // Otherwise go to the best partial match on this site.
    const partialMatches = getSuggestions(query);
    if (partialMatches.length > 0) {
      navigate(partialMatches[0].path);
      setShowSuggestions(false);
      setNoResults(false);
      return;
    }

    // No match on this site: stay here and say so in the suggestions
    // dropdown instead of leaving the site for an external search engine.
    setSuggestions([]);
    setNoResults(true);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: {
    title: string;
    path: string;
  }) => {
    navigate(suggestion.path);
    setSearchQuery("");
    setShowSuggestions(false);
    setNoResults(false);
  };

  return {
    searchQuery,
    showSuggestions,
    noResults,
    suggestions,
    handleSearchChange,
    handleSearchSubmit,
    handleSuggestionClick,
  };
};

export default useSearch;
