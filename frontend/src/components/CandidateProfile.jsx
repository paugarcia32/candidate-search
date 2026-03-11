import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CreateCandidateModal from "./CreateCandidateModal";
import "../styles/CandidateProfile.css";

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

  if (loading) return <div className="page-container profile-page"><p className="text-subtle">Loading...</p></div>;
  if (notFound) return <div className="page-container profile-page"><p className="text-subtle">Candidate not found.</p></div>;
  if (!candidate) return null;

  return (
    <div className="page-container profile-page">
      {showEdit && (
        <CreateCandidateModal
          candidate={candidate}
          onClose={() => setShowEdit(false)}
          onCreated={handleEdited}
        />
      )}

      {/* Back button + actions */}
      <div className="profile__nav">
        <button onClick={() => navigate(-1)} className="btn btn-ghost">
          ← Back
        </button>

        <div className="profile__nav-actions">
          {confirmDelete ? (
            <>
              <span className="confirm-label">Are you sure?</span>
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
      <div className="profile__header">
        {candidate.photo && (
          <img
            src={candidate.photo}
            alt={candidate.name}
            className="profile__avatar"
          />
        )}
        <div className="profile__header-body">
          <div className="profile__name-row">
            <h1 className="profile__name">{candidate.name}</h1>
            {score !== null && (
              <span className="badge-accent">
                {(score * 100).toFixed(1)}% match
              </span>
            )}
          </div>
          <div className="profile__meta">
            {candidate.location && <span>📍 {candidate.location}</span>}
            {candidate.email && <span>✉️ {candidate.email}</span>}
            {candidate.phone && <span>📞 {candidate.phone}</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {candidate.summary && (
        <p className="profile__summary">{candidate.summary}</p>
      )}

      <div className="profile__sections">
        {/* Experience */}
        {candidate.experience?.length > 0 && (
          <section>
            <h2 className="section-label">Experience</h2>
            {candidate.experience.map((exp, i) => (
              <div key={i} className="profile__entry">
                <div className="profile__entry-header">
                  <strong className="profile__entry-title">{exp.role}</strong>
                  <span className="profile__entry-period">{formatPeriod(exp.start, exp.end)}</span>
                </div>
                <div className="profile__entry-subtitle">{exp.company}</div>
                <div className="profile__entry-body">{exp.description}</div>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {candidate.education?.length > 0 && (
          <section>
            <h2 className="section-label">Education</h2>
            {candidate.education.map((edu, i) => (
              <div key={i} className="profile__entry">
                <div className="profile__entry-header">
                  <strong className="profile__entry-title">{edu.degree}</strong>
                  <span className="profile__entry-period">{formatPeriod(edu.start, edu.end)}</span>
                </div>
                <div className="profile__entry-subtitle">{edu.institution}</div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {candidate.certifications?.length > 0 && (
          <section>
            <h2 className="section-label">Certifications</h2>
            <div className="cert-list">
              {candidate.certifications.map((cert, i) => (
                <div key={i} className="cert-badge">
                  <div className="cert-badge__name">{cert.name}</div>
                  {(cert.issuer || cert.year) && (
                    <div className="cert-badge__meta">
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
