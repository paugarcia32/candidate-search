import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import CandidateProfile from "./components/CandidateProfile";

function CandidateCard({ candidate }) {
  return (
    <li style={{ marginBottom: "16px" }}>
      <Link
        to={`/candidates/${candidate.id}`}
        state={{ score: candidate.score }}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
            cursor: "pointer",
            transition: "box-shadow 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          {candidate.photo && (
            <img
              src={candidate.photo}
              alt={candidate.name}
              style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <strong style={{ fontSize: "17px" }}>{candidate.name}</strong>
              <span
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#1d4ed8",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                {(candidate.score * 100).toFixed(1)}% match
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px", fontSize: "13px", color: "#6b7280" }}>
              {candidate.location && <span>📍 {candidate.location}</span>}
              {candidate.email && <span>✉️ {candidate.email}</span>}
              {candidate.phone && <span>📞 {candidate.phone}</span>}
            </div>
            <p style={{ margin: "8px 0 0", color: "#374151", lineHeight: "1.5", fontSize: "14px" }}>
              {candidate.summary}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  function handleResults(data) {
    setResults(data);
    setSearched(true);
  }

  return (
    <div style={{ maxWidth: "760px", margin: "60px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Candidate Search</h1>
      <p style={{ color: "#555", marginBottom: "24px" }}>
        Describe the profile you are looking for in natural language.
      </p>

      <SearchBar onResults={handleResults} onLoading={setLoading} />

      {loading && <p style={{ marginTop: "24px", color: "#555" }}>Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <p style={{ marginTop: "24px", color: "#555" }}>No results found.</p>
      )}

      {!loading && results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "24px" }}>
          {results.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/candidates/:id" element={<CandidateProfile />} />
    </Routes>
  );
}
