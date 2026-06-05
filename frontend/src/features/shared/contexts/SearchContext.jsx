/* eslint-disable react-refresh/only-export-components */
// src/shared/contexts/SearchContext.jsx
import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext({
  searchTerm: "",
  setSearchTerm: () => {},
});

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
