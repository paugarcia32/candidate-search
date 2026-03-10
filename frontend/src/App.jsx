import { useState } from "react";
import SearchBar from "./components/SearchBar";

function formatPeriod(start, end) {
  if (!start) return "";
  const fmt = (d) => {
    const [year, month] = d.split("-");
    return month
      ? new Date(year, month - 1).toLocaleString("en-GB", { month: "short", year: "numeric" })
      : year;
  };
  return `${fmt(start)} – ${end ? fmt(end) : "Present"}`;
}

function CandidateCard({ candidate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        marginBottom: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {candidate.photo && (
          <img
            src={candidate.photo}
            alt={candidate.name}
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
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

          {/* Contact info */}
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

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "8px",
          background: "#f9fafb",
          border: "none",
          borderTop: "1px solid #e5e7eb",
          cursor: "pointer",
          fontSize: "13px",
          color: "#6b7280",
        }}
      >
        {expanded ? "▲ Hide details" : "▼ View experience, education & certifications"}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Experience */}
          {candidate.experience?.length > 0 && (
            <section>
              <h4 style={{ margin: "0 0 10px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af" }}>
                Experience
              </h4>
              {candidate.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <strong style={{ fontSize: "14px" }}>{exp.role}</strong>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{formatPeriod(exp.start, exp.end)}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>{exp.company}</div>
                  <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>{exp.description}</div>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {candidate.education?.length > 0 && (
            <section>
              <h4 style={{ margin: "0 0 10px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af" }}>
                Education
              </h4>
              {candidate.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <strong style={{ fontSize: "14px" }}>{edu.degree}</strong>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{formatPeriod(edu.start, edu.end)}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>{edu.institution}</div>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {candidate.certifications?.length > 0 && (
            <section>
              <h4 style={{ margin: "0 0 10px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af" }}>
                Certifications
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {candidate.certifications.map((cert, i) => (
                  <span
                    key={i}
                    title={`${cert.issuer} · ${cert.year}`}
                    style={{
                      backgroundColor: "#f0fdf4",
                      color: "#15803d",
                      border: "1px solid #bbf7d0",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {cert.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </li>
  );
}

export default function App() {
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
          {results.map((candidate, i) => (
            <CandidateCard key={i} candidate={candidate} />
          ))}
        </ul>
      )}
    </div>
  );
}
