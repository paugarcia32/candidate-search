import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CreateCandidateModal from "./CreateCandidateModal";

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
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/candidates/${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setCandidate(data); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/v1/candidates/${id}`, { method: "DELETE" });
    navigate("/");
  }

  function handleEdited() {
    setShowEdit(false);
    setLoading(true);
    fetch(`/api/v1/candidates/${id}`)
      .then((res) => res.json())
      .then((data) => setCandidate(data))
      .finally(() => setLoading(false));
  }

  if (loading) return (
    <div className="page-container mt-8">
      <p className="text-foreground-subtle">Loading...</p>
    </div>
  );
  if (notFound) return (
    <div className="page-container mt-8">
      <p className="text-foreground-subtle">Candidate not found.</p>
    </div>
  );
  if (!candidate) return null;

  return (
    <div className="page-container mt-8 mb-10">
      {showEdit && (
        <CreateCandidateModal
          candidate={candidate}
          onClose={() => setShowEdit(false)}
          onCreated={handleEdited}
        />
      )}

      {/* Nav */}
      <div className="flex justify-between items-center mb-5">
        <button onClick={() => navigate(-1)} className="btn btn-ghost text-sm">
          ← Back
        </button>

        <div className="flex gap-2 items-center">
          {confirmDelete ? (
            <>
              <span className="text-[13px] text-foreground-secondary">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger-filled"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowEdit(true)} className="btn btn-secondary btn-sm">
                Edit
              </button>
              <button onClick={() => setConfirmDelete(true)} className="btn btn-danger">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex gap-5 items-start mb-6">
        {candidate.photo && (
          <img
            src={candidate.photo}
            alt={candidate.name}
            className="w-20 h-20 rounded-full object-cover shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-2xl font-bold m-0">{candidate.name}</h1>
            {score !== null && (
              <span className="badge-accent">
                {(score * 100).toFixed(1)}% match
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-foreground-subtle">
            {candidate.location && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {candidate.location}
              </span>
            )}
            {candidate.email && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,12 2,6"/>
                </svg>
                {candidate.email}
              </span>
            )}
            {candidate.phone && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6.06 6.06l1.27-.78a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {candidate.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {candidate.summary && (
        <p className="text-[15px] text-foreground-secondary leading-relaxed mb-8">
          {candidate.summary}
        </p>
      )}

      <div className="flex flex-col gap-7">
        {/* Experience */}
        {candidate.experience?.length > 0 && (
          <section>
            <h2 className="section-label">Experience</h2>
            {candidate.experience.map((exp, i) => (
              <div
                key={i}
                className={`pb-4 ${i < candidate.experience.length - 1 ? "mb-4 border-b border-border-subtle" : ""}`}
              >
                <div className="flex justify-between flex-wrap gap-1">
                  <strong className="text-[15px] font-semibold">{exp.role}</strong>
                  <span className="text-[13px] text-foreground-muted">{formatPeriod(exp.start, exp.end)}</span>
                </div>
                <div className="text-sm text-foreground-subtle mt-0.5 mb-1.5">{exp.company}</div>
                <div className="text-sm text-foreground-secondary leading-relaxed">{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {candidate.education?.length > 0 && (
          <section>
            <h2 className="section-label">Education</h2>
            {candidate.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between flex-wrap gap-1">
                  <strong className="text-[15px] font-semibold">{edu.degree}</strong>
                  <span className="text-[13px] text-foreground-muted">{formatPeriod(edu.start, edu.end)}</span>
                </div>
                <div className="text-sm text-foreground-subtle">{edu.institution}</div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {candidate.certifications?.length > 0 && (
          <section>
            <h2 className="section-label">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.certifications.map((cert, i) => (
                <div
                  key={i}
                  className="bg-success text-success-foreground border border-success-border px-3.5 py-1.5 rounded-lg text-sm"
                >
                  <div className="font-medium">{cert.name}</div>
                  {(cert.issuer || cert.year) && (
                    <div className="text-[11px] text-success-muted mt-0.5">
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
