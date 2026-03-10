import { useState } from "react";

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
    <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. backend developer with Python experience"
        style={{
          flex: 1,
          padding: "10px 14px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}
