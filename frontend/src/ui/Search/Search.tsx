// src/ui/Search/Search.tsx

import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="w-full flex items-center p-2">
      <input
        type="text"
        placeholder="Rechercher un post..."
        className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
      >
        Rechercher
      </button>
    </form>
  );
};

export default Search;
