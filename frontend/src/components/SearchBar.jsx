import { useState } from "react";

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

export default function SearchBar({ onResults, onLoading }) {
  const [query, setQuery] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    onLoading(true);
    try {
      const res = await fetch("/api/v1/candidates/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 }),
      });
      const data = await res.json();
      onResults(data);
    } catch (err) {
      console.error(err);
      onResults([]);
    } finally {
      onLoading(false);
    }
  }

  return (
    <form className="flex gap-2" onSubmit={handleSearch}>
      <div className="search-wrapper flex-1">
        <span className="search-icon">
          <IconSearch />
        </span>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. backend developer with Python experience"
        />
      </div>
      <button type="submit" className="btn btn-primary" style={{ padding: "0 20px" }}>
        Search
      </button>
    </form>
  );
}
