import { useState, useEffect, useDeferredValue } from 'react';

/**
 * Custom hook that combines debouncing and deferred values for optimized search experience
 * 
 * @param {string} initialValue - Initial search value
 * @param {number} debounceDelay - Delay in ms before applying the search value (default: 300ms)
 * @returns {Object} - Object containing search state and handlers
 */
export function useSearch(initialValue = '', debounceDelay = 300) {
  // Immediate state for input field
  const [inputValue, setInputValue] = useState(initialValue);
  
  // Debounced state (updates after delay)
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  // Deferred value for rendering expensive UI (handled by React)
  const deferredValue = useDeferredValue(debouncedValue);
  
  // For tracking if the deferred value is stale
  const isStale = debouncedValue !== deferredValue;
  
  // Setup debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, debounceDelay);
    
    return () => clearTimeout(timer);
  }, [inputValue, debounceDelay]);
  
  // Handler for input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  return {
    inputValue,          // Current input value (updates immediately for the input field)
    debouncedValue,      // Value after debounce delay (good for network requests)
    deferredValue,       // Value for expensive UI rendering (managed by React)
    isStale,             // Whether the UI is showing stale results
    setInputValue,       // Function to set the input value programmatically
    handleInputChange,   // Event handler for input element
  };
}

/**
 * Custom hook for handling search results with optimized performance
 * 
 * @param {Function} searchFunction - Function that takes a query and returns results (can be async)
 * @param {Object} options - Configuration options
 * @param {string} options.initialQuery - Initial search query (default: '')
 * @param {number} options.debounceDelay - Delay before executing search (default: 300ms)
 * @returns {Object} - Object containing search state, results and handlers
 */
export function useSearchResults(searchFunction, { initialQuery = '', debounceDelay = 300 } = {}) {
  // Use our search hook for input handling
  const { 
    inputValue, 
    debouncedValue, 
    deferredValue, 
    isStale, 
    handleInputChange 
  } = useSearch(initialQuery, debounceDelay);
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Execute search when debounced query changes
  useEffect(() => {
    // Skip empty searches
    if (!debouncedValue.trim()) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // Flag to handle race conditions
    let isCurrent = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await searchFunction(debouncedValue);
        
        // Only update state if this is the latest request
        if (isCurrent) {
          setResults(data);
          setIsLoading(false);
        }
      } catch (err) {
        // Only update state if this is the latest request
        if (isCurrent) {
          setError(err);
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function to handle component unmount or new search
    return () => {
      isCurrent = false;
    };
  }, [debouncedValue, searchFunction]);
  
  return {
    query: inputValue,
    debouncedQuery: debouncedValue,
    deferredQuery: deferredValue,
    isStale,
    results,
    isLoading,
    error,
    setQuery: setInputValue,
    handleQueryChange: handleInputChange,
  };
}
