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
    <div className="page-container mt-10">
      <p className="text-foreground-subtle">Loading...</p>
    </div>
  );
  if (notFound) return (
    <div className="page-container mt-10">
      <p className="text-foreground-subtle">Candidate not found.</p>
    </div>
  );
  if (!candidate) return null;

  return (
    <div className="page-container mt-10 mb-10">
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
            {candidate.location && <span>📍 {candidate.location}</span>}
            {candidate.email && <span>✉️ {candidate.email}</span>}
            {candidate.phone && <span>📞 {candidate.phone}</span>}
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
