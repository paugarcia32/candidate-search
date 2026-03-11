import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import CandidateProfile from "./components/CandidateProfile";
import CreateCandidateModal from "./components/CreateCandidateModal";
import Header from "./components/Header";

const PAGE_SIZE = 9;

function IconLocation() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,12 2,6"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6.06 6.06l1.27-.78a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function CandidateCard({ candidate }) {
  const initials = candidate.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <li>
      <Link
        to={`/candidates/${candidate.id}`}
        state={{ score: candidate.score }}
        className="block no-underline text-inherit"
      >
        <div className="candidate-card">
          {candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-[13px] font-semibold"
              style={{
                backgroundColor: "var(--color-accent-subtle)",
                color: "var(--color-accent-foreground)",
              }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <strong className="text-[15px] font-semibold text-foreground" style={{ fontFamily: "var(--font-family-display)" }}>
                {candidate.name}
              </strong>
              {candidate.score != null && (
                <span className="badge-accent">
                  {(candidate.score * 100).toFixed(1)}% match
                </span>
              )}
            </div>
            <div className="candidate-meta">
              {candidate.location && (
                <span className="candidate-meta-item">
                  <IconLocation />
                  {candidate.location}
                </span>
              )}
              {candidate.email && (
                <span className="candidate-meta-item">
                  <IconMail />
                  {candidate.email}
                </span>
              )}
              {candidate.phone && (
                <span className="candidate-meta-item">
                  <IconPhone />
                  {candidate.phone}
                </span>
              )}
            </div>
            <p className="mt-2 text-[13px] text-foreground-subtle leading-relaxed line-clamp-2">
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
    <div className="page-container mt-8 mb-10">
      {showModal && (
        <CreateCandidateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {/* Search area */}
      <div className="mb-6">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            + New Candidate
          </button>
        </div>
        <SearchBar onResults={handleResults} onLoading={handleSearchLoading} />
        <p className="mt-2.5 text-[13px] text-foreground-muted">
          Describe the profile you are looking for in natural language.
        </p>
      </div>

      {/* Search results */}
      {searchLoading && (
        <p className="mt-6 text-sm text-foreground-subtle">Searching...</p>
      )}

      {!searchLoading && isSearchMode && searchResults.length === 0 && (
        <p className="mt-6 text-sm text-foreground-subtle">No results found.</p>
      )}

      {!searchLoading && isSearchMode && searchResults.length > 0 && (
        <>
          <p className="mb-3 text-[12px] text-foreground-muted uppercase tracking-wide font-medium">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
          <ul className="list-none p-0 flex flex-col gap-2">
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
            <p className="mt-6 text-sm text-foreground-subtle">Loading candidates...</p>
          ) : (
            <>
              <p className="mb-3 text-[12px] text-foreground-muted uppercase tracking-wide font-medium">
                All candidates · {browse.total}
              </p>
              <ul className="list-none p-0 flex flex-col gap-2">
                {browse.items.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 mb-10">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    ← Prev
                  </button>
                  <span className="text-[13px] text-foreground-subtle">
                    {page} / {totalPages}
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
    <>
      <Header />
      <main style={{ paddingTop: "52px" }}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
        </Routes>
      </main>
    </>
  );
}
