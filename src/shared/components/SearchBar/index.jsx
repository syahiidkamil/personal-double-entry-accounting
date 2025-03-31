import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/**
 * Reusable search bar component with debounce support
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Change handler function
 * @param {Function} props.onSubmit - Form submit handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.showButton - Whether to show search button
 * @param {string} props.buttonText - Text to display on button
 */
const SearchBar = ({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Search...",
  showButton = true,
  buttonText = "Search",
  className = "",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-8"
          value={value}
          onChange={onChange}
        />
      </div>
      {showButton && (
        <Button type="submit" className="ml-2">
          {buttonText}
        </Button>
      )}
    </form>
  );
};

export default SearchBar;