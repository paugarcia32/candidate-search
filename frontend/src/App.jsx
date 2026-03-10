import { useState } from "react";
import SearchBar from "./components/SearchBar";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  function handleResults(data) {
    setResults(data);
    setSearched(true);
  }

  return (
    <div style={{ maxWidth: "720px", margin: "60px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Candidate Search</h1>
      <p style={{ color: "#555", marginBottom: "24px" }}>
        Describe the profile you are looking for in natural language.
      </p>

      <SearchBar onResults={handleResults} onLoading={setLoading} />

      {loading && (
        <p style={{ marginTop: "24px", color: "#555" }}>Searching...</p>
      )}

      {!loading && searched && results.length === 0 && (
        <p style={{ marginTop: "24px", color: "#555" }}>No results found.</p>
      )}

      {!loading && results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "24px" }}>
          {results.map((candidate, i) => (
            <li
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "17px" }}>{candidate.name}</strong>
                <span
                  style={{
                    backgroundColor: "#dbeafe",
                    color: "#1d4ed8",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {(candidate.score * 100).toFixed(1)}% match
                </span>
              </div>
              <p style={{ margin: "8px 0 0", color: "#374151", lineHeight: "1.5" }}>
                {candidate.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
