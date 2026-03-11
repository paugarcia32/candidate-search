import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import CandidateProfile from "./components/CandidateProfile";
import CreateCandidateModal from "./components/CreateCandidateModal";
import ThemeToggle from "./components/ThemeToggle";

const PAGE_SIZE = 9;

function CandidateCard({ candidate }) {
  return (
    <li className="mb-4">
      <Link
        to={`/candidates/${candidate.id}`}
        state={{ score: candidate.score }}
        className="block no-underline text-inherit"
      >
        <div className="border border-border rounded-lg p-4 flex gap-4 items-start cursor-pointer transition-all hover:shadow-md hover:border-border-strong hover:bg-bg-subtle">
          {candidate.photo && (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <strong className="text-[17px] font-semibold text-foreground">{candidate.name}</strong>
              {candidate.score != null && (
                <span className="badge-accent">
                  {(candidate.score * 100).toFixed(1)}% match
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-[13px] text-foreground-subtle">
              {candidate.location && <span>📍 {candidate.location}</span>}
              {candidate.email && <span>✉️ {candidate.email}</span>}
              {candidate.phone && <span>📞 {candidate.phone}</span>}
            </div>
            <p className="mt-2 text-sm text-foreground-secondary leading-normal">
              {candidate.summary}
            </p>
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
    <div className="page-container mt-[60px] mb-10">
      <div className="flex justify-between items-center gap-2 mb-2">
        <h1 className="text-[28px] font-bold m-0">Candidate Search</h1>
        <div className="flex items-center gap-2">
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

      <p className="text-foreground-subtle mb-6">
        Describe the profile you are looking for in natural language.
      </p>

      {showModal && (
        <CreateCandidateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <SearchBar onResults={handleResults} onLoading={handleSearchLoading} />

      {/* Search results */}
      {searchLoading && (
        <p className="mt-6 text-foreground-subtle">Searching...</p>
      )}

      {!searchLoading && isSearchMode && searchResults.length === 0 && (
        <p className="mt-6 text-foreground-subtle">No results found.</p>
      )}

      {!searchLoading && isSearchMode && searchResults.length > 0 && (
        <>
          <p className="mt-6 mb-2 text-[13px] text-foreground-muted">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
          <ul className="list-none p-0">
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
            <p className="mt-6 text-foreground-subtle">Loading candidates...</p>
          ) : (
            <>
              <ul className="list-none p-0 mt-6">
                {browse.items.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-2 mb-10">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    ← Prev
                  </button>
                  <span className="text-[13px] text-foreground-subtle">
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
