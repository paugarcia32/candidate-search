import { useState } from "react";

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

export default function SearchBar({ onSearch, onClear }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  }

  function handleClear() {
    setQuery("");
    onClear?.();
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <div className="search-wrapper flex-1">
        <span className="search-icon">
          <IconSearch />
        </span>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && handleClear()}
          placeholder="e.g. backend developer with Python experience"
          style={{ paddingRight: query ? "40px" : "14px" }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-foreground-muted)",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              borderRadius: "4px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-foreground)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-foreground-muted)"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary" style={{ padding: "0 20px" }}>
        Search
      </button>
    </form>
  );
}
