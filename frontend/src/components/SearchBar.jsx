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
    <form className="flex gap-2" onSubmit={handleSearch}>
      <input
        type="text"
        className="form-input flex-1 text-base px-3.5 py-2.5"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. backend developer with Python experience"
      />
      <button type="submit" className="btn btn-primary text-base px-5 py-2.5">
        Search
      </button>
    </form>
  );
}
