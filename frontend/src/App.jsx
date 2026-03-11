import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import CandidateProfile from "./components/CandidateProfile";
import CreateCandidateModal from "./components/CreateCandidateModal";
import ThemeToggle from "./components/ThemeToggle";
import "./styles/App.css";

const PAGE_SIZE = 9;

function CandidateCard({ candidate }) {
  return (
    <li className="candidate-card-item">
      <Link
        to={`/candidates/${candidate.id}`}
        state={{ score: candidate.score }}
        className="candidate-card-link"
      >
        <div className="candidate-card">
          {candidate.photo && (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="candidate-card__avatar"
            />
          )}
          <div className="candidate-card__body">
            <div className="candidate-card__header">
              <strong className="candidate-card__name">{candidate.name}</strong>
              {candidate.score != null && (
                <span className="badge-accent">
                  {(candidate.score * 100).toFixed(1)}% match
                </span>
              )}
            </div>
            <div className="candidate-card__meta">
              {candidate.location && <span>📍 {candidate.location}</span>}
              {candidate.email && <span>✉️ {candidate.email}</span>}
              {candidate.phone && <span>📞 {candidate.phone}</span>}
            </div>
            <p className="candidate-card__summary">{candidate.summary}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}

function SearchPage() {
  const [searchResults, setSearchResults] = useState(null);
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
    if (val) setSearchResults(null);
  }

  const totalPages = Math.ceil(browse.total / PAGE_SIZE);
  const isSearchMode = searchResults !== null;

  return (
    <div className="page-container search-page">
      <div className="search-page__header">
        <h1 className="search-page__title">Candidate Search</h1>
        <div className="search-page__header-actions">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            + New Candidate
          </button>
          <ThemeToggle />
        </div>
      </div>
      <p className="search-page__desc text-subtle">
        Describe the profile you are looking for in natural language.
      </p>

      {showModal && (
        <CreateCandidateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <SearchBar onResults={handleResults} onLoading={handleSearchLoading} />

      {/* Search results */}
      {searchLoading && <p style={{ marginTop: "24px" }} className="text-subtle">Searching...</p>}

      {!searchLoading && isSearchMode && searchResults.length === 0 && (
        <p style={{ marginTop: "24px" }} className="text-subtle">No results found.</p>
      )}

      {!searchLoading && isSearchMode && searchResults.length > 0 && (
        <>
          <p style={{ marginTop: "24px", marginBottom: "8px", fontSize: "13px" }} className="text-muted">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
          <ul className="candidate-list-results">
            {searchResults.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </ul>
        </>
      )}

      {/* Browse mode */}
      {!isSearchMode && !searchLoading && (
        <>
          {browseLoading ? (
            <p style={{ marginTop: "24px" }} className="text-subtle">Loading candidates...</p>
          ) : (
            <>
              <ul className="candidate-list">
                {browse.items.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    ← Prev
                  </button>
                  <span className="pagination__label">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="btn btn-secondary btn-sm"
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
