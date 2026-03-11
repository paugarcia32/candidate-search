import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import CandidateProfile from "./components/CandidateProfile";
import CreateCandidateModal from "./components/CreateCandidateModal";

const PAGE_SIZE = 9;

function CandidateCard({ candidate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <li style={{ marginBottom: "16px" }}>
      <Link
        to={`/candidates/${candidate.id}`}
        state={{ score: candidate.score }}
        style={{ textDecoration: "none", color: "inherit" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
            boxShadow: hovered ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          }}
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
              {candidate.score != null && (
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
              )}
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
  const [searchResults, setSearchResults] = useState(null); // null = not searched yet
  const [searchLoading, setSearchLoading] = useState(false);

  const [browse, setBrowse] = useState({ items: [], total: 0 });
  const [browseLoading, setBrowseLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setBrowseLoading(true);
    const offset = (page - 1) * PAGE_SIZE;
    fetch(`/api/v1/candidates?limit=${PAGE_SIZE}&offset=${offset}`)
      .then((r) => r.json())
      .then((data) => setBrowse({ items: data.items ?? [], total: data.total ?? 0, limit: data.limit ?? PAGE_SIZE, offset: data.offset ?? 0 }))
      .finally(() => setBrowseLoading(false));
  }, [page, refreshKey]);

  function handleCreated() {
    setShowModal(false);
    setPage(1);
    setRefreshKey((k) => k + 1);
  }

  function handleResults(data) {
    setSearchResults(data);
  }

  function handleSearchLoading(val) {
    setSearchLoading(val);
    if (val) setSearchResults(null); // clear previous search while loading
  }

  const totalPages = Math.ceil(browse.total / PAGE_SIZE);
  const isSearchMode = searchResults !== null;

  return (
    <div style={{ maxWidth: "760px", margin: "60px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "28px", margin: 0 }}>Candidate Search</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 18px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          + New Candidate
        </button>
      </div>
      <p style={{ color: "#555", marginBottom: "24px" }}>
        Describe the profile you are looking for in natural language.
      </p>

      {showModal && (
        <CreateCandidateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <SearchBar onResults={handleResults} onLoading={handleSearchLoading} />

      {/* Search results */}
      {searchLoading && <p style={{ marginTop: "24px", color: "#555" }}>Searching...</p>}

      {!searchLoading && isSearchMode && searchResults.length === 0 && (
        <p style={{ marginTop: "24px", color: "#555" }}>No results found.</p>
      )}

      {!searchLoading && isSearchMode && searchResults.length > 0 && (
        <>
          <p style={{ marginTop: "24px", marginBottom: "8px", fontSize: "13px", color: "#9ca3af" }}>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {searchResults.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </ul>
        </>
      )}

      {/* Browse mode (no active search) */}
      {!isSearchMode && !searchLoading && (
        <>
          {browseLoading ? (
            <p style={{ marginTop: "24px", color: "#555" }}>Loading candidates...</p>
          ) : (
            <>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "24px" }}>
                {browse.items.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </ul>

              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "8px", marginBottom: "40px" }}>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: page === 1 ? "#f9fafb" : "#fff",
                      color: page === 1 ? "#d1d5db" : "#374151",
                      cursor: page === 1 ? "default" : "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ← Prev
                  </button>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: page === totalPages ? "#f9fafb" : "#fff",
                      color: page === totalPages ? "#d1d5db" : "#374151",
                      cursor: page === totalPages ? "default" : "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </>
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
