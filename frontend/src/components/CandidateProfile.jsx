import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

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

export default function CandidateProfile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score ?? null;

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/candidates/${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setCandidate(data); })
      .finally(() => setLoading(false));
  }, [id]);

  const containerStyle = { maxWidth: "760px", margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" };

  if (loading) return <div style={containerStyle}><p style={{ color: "#555" }}>Loading...</p></div>;
  if (notFound) return <div style={containerStyle}><p style={{ color: "#555" }}>Candidate not found.</p></div>;
  if (!candidate) return null;

  return (
    <div style={containerStyle}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#6b7280",
          fontSize: "14px",
          padding: "0 0 20px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "24px" }}>
        {candidate.photo && (
          <img
            src={candidate.photo}
            alt={candidate.name}
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", margin: 0 }}>{candidate.name}</h1>
            {score !== null && (
              <span
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#1d4ed8",
                  padding: "3px 12px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {(score * 100).toFixed(1)}% match
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
            {candidate.location && <span>📍 {candidate.location}</span>}
            {candidate.email && <span>✉️ {candidate.email}</span>}
            {candidate.phone && <span>📞 {candidate.phone}</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {candidate.summary && (
        <p style={{ color: "#374151", lineHeight: "1.6", fontSize: "15px", marginBottom: "32px" }}>
          {candidate.summary}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Experience */}
        {candidate.experience?.length > 0 && (
          <section>
            <h2 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", margin: "0 0 14px" }}>
              Experience
            </h2>
            {candidate.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: i < candidate.experience.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                  <strong style={{ fontSize: "15px" }}>{exp.role}</strong>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>{formatPeriod(exp.start, exp.end)}</span>
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280", margin: "2px 0 6px" }}>{exp.company}</div>
                <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {candidate.education?.length > 0 && (
          <section>
            <h2 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", margin: "0 0 14px" }}>
              Education
            </h2>
            {candidate.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                  <strong style={{ fontSize: "15px" }}>{edu.degree}</strong>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>{formatPeriod(edu.start, edu.end)}</span>
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>{edu.institution}</div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {candidate.certifications?.length > 0 && (
          <section>
            <h2 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", margin: "0 0 14px" }}>
              Certifications
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {candidate.certifications.map((cert, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#f0fdf4",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ fontWeight: "500" }}>{cert.name}</div>
                  {(cert.issuer || cert.year) && (
                    <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "2px" }}>
                      {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
