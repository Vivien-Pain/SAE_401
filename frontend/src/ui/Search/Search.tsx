// src/ui/Search/Search.tsx

import { useState } from "react";

// Import des styles CVA
import { searchForm, searchInput, searchButton } from "./SearchStyles";

interface SearchProps {
  onSearch: (query: string) => void;
}

const Search = ({ onSearch }: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className={searchForm()}>
      <input
        type="text"
        placeholder="Rechercher un post..."
        className={searchInput()}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="submit"
        className={searchButton()}
      >
        Rechercher
      </button>
    </form>
  );
};

export default Search;
