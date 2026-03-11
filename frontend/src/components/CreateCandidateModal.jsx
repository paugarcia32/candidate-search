import { useState } from "react";
import "../styles/CreateCandidateModal.css";

const emptyExperience = () => ({ company: "", role: "", start: "", end: "", description: "" });
const emptyEducation = () => ({ institution: "", degree: "", start: "", end: "" });
const emptyCertification = () => ({ name: "", issuer: "", year: "" });

function Field({ label, value, onChange, required, placeholder, type = "text", rows }) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}{required && <span className="form-required"> *</span>}
      </label>
      {rows ? (
        <textarea
          className="form-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          className="form-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function CreateCandidateModal({ onClose, onCreated, candidate }) {
  const isEdit = !!candidate;

  const [form, setForm] = useState({
    name: candidate?.name ?? "",
    email: candidate?.email ?? "",
    phone: candidate?.phone ?? "",
    location: candidate?.location ?? "",
    photo: candidate?.photo ?? "",
    summary: candidate?.summary ?? "",
  });
  const [experience, setExperience] = useState(
    candidate?.experience?.map((e) => ({ ...e, end: e.end ?? "" })) ?? []
  );
  const [education, setEducation] = useState(
    candidate?.education?.map((e) => ({ ...e, end: e.end ?? "" })) ?? []
  );
  const [certifications, setCertifications] = useState(
    candidate?.certifications?.map((c) => ({ ...c, year: c.year != null ? String(c.year) : "" })) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function setField(key) {
    return (val) => setForm((f) => ({ ...f, [key]: val }));
  }

  function updateEntry(list, setList, index, key, value) {
    const updated = list.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    setList(updated);
  }

  function removeEntry(list, setList, index) {
    setList(list.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      summary: form.summary.trim(),
      ...(form.email.trim() && { email: form.email.trim() }),
      ...(form.phone.trim() && { phone: form.phone.trim() }),
      ...(form.location.trim() && { location: form.location.trim() }),
      ...(form.photo.trim() && { photo: form.photo.trim() }),
      experience: experience
        .filter((e) => e.company.trim() || e.role.trim())
        .map((e) => ({
          company: e.company.trim(),
          role: e.role.trim(),
          start: e.start.trim(),
          end: e.end.trim() || null,
          description: e.description.trim(),
        })),
      education: education
        .filter((e) => e.institution.trim() || e.degree.trim())
        .map((e) => ({
          institution: e.institution.trim(),
          degree: e.degree.trim(),
          start: e.start.trim(),
          end: e.end.trim() || null,
        })),
      certifications: certifications
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          issuer: c.issuer.trim(),
          year: c.year ? parseInt(c.year, 10) : null,
        })),
    };

    try {
      const url = isEdit ? `/api/v1/candidates/${candidate.id}` : "/api/v1/candidates";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }

      onCreated();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-header">
          <h2>{isEdit ? "Edit Candidate" : "New Candidate"}</h2>
          <button onClick={onClose} className="btn btn-ghost modal-close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic info */}
          <Field label="Name" value={form.name} onChange={setField("name")} required placeholder="Full name" />
          <Field label="Summary" value={form.summary} onChange={setField("summary")} required placeholder="Professional summary..." rows={3} />
          <div className="form-grid-2">
            <Field label="Email" value={form.email} onChange={setField("email")} placeholder="email@example.com" type="email" />
            <Field label="Phone" value={form.phone} onChange={setField("phone")} placeholder="+1 555 000 0000" />
          </div>
          <div className="form-grid-2">
            <Field label="Location" value={form.location} onChange={setField("location")} placeholder="City, Country" />
            <Field label="Photo URL" value={form.photo} onChange={setField("photo")} placeholder="https://..." />
          </div>

          {/* Experience */}
          <div className="modal-section-title">Experience</div>
          {experience.map((exp, i) => (
            <div key={i} className="entry-box">
              <button type="button" className="entry-box__remove" onClick={() => removeEntry(experience, setExperience, i)}>✕</button>
              <div className="form-grid-2">
                <Field label="Company" value={exp.company} onChange={(v) => updateEntry(experience, setExperience, i, "company", v)} placeholder="Company name" />
                <Field label="Role" value={exp.role} onChange={(v) => updateEntry(experience, setExperience, i, "role", v)} placeholder="Job title" />
                <Field label="Start (YYYY-MM)" value={exp.start} onChange={(v) => updateEntry(experience, setExperience, i, "start", v)} placeholder="2022-01" />
                <Field label="End (YYYY-MM)" value={exp.end} onChange={(v) => updateEntry(experience, setExperience, i, "end", v)} placeholder="2024-06 or leave blank" />
              </div>
              <Field label="Description" value={exp.description} onChange={(v) => updateEntry(experience, setExperience, i, "description", v)} placeholder="Role description..." rows={2} />
            </div>
          ))}
          <button type="button" className="btn btn-accent-outline" onClick={() => setExperience([...experience, emptyExperience()])}>
            + Add experience
          </button>

          {/* Education */}
          <div className="modal-section-title">Education</div>
          {education.map((edu, i) => (
            <div key={i} className="entry-box">
              <button type="button" className="entry-box__remove" onClick={() => removeEntry(education, setEducation, i)}>✕</button>
              <div className="form-grid-2">
                <Field label="Institution" value={edu.institution} onChange={(v) => updateEntry(education, setEducation, i, "institution", v)} placeholder="University name" />
                <Field label="Degree" value={edu.degree} onChange={(v) => updateEntry(education, setEducation, i, "degree", v)} placeholder="B.Sc. Computer Science" />
                <Field label="Start (YYYY-MM)" value={edu.start} onChange={(v) => updateEntry(education, setEducation, i, "start", v)} placeholder="2018-09" />
                <Field label="End (YYYY-MM)" value={edu.end} onChange={(v) => updateEntry(education, setEducation, i, "end", v)} placeholder="2022-06" />
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-accent-outline" onClick={() => setEducation([...education, emptyEducation()])}>
            + Add education
          </button>

          {/* Certifications */}
          <div className="modal-section-title">Certifications</div>
          {certifications.map((cert, i) => (
            <div key={i} className="entry-box">
              <button type="button" className="entry-box__remove" onClick={() => removeEntry(certifications, setCertifications, i)}>✕</button>
              <div className="form-grid-3">
                <Field label="Name" value={cert.name} onChange={(v) => updateEntry(certifications, setCertifications, i, "name", v)} placeholder="AWS Solutions Architect" />
                <Field label="Issuer" value={cert.issuer} onChange={(v) => updateEntry(certifications, setCertifications, i, "issuer", v)} placeholder="Amazon" />
                <Field label="Year" value={cert.year} onChange={(v) => updateEntry(certifications, setCertifications, i, "year", v)} placeholder="2023" type="number" />
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-accent-outline" onClick={() => setCertifications([...certifications, emptyCertification()])}>
            + Add certification
          </button>

          {/* Error */}
          {error && <p className="form-error">{error}</p>}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim() || !form.summary.trim()}
              className="btn btn-primary"
            >
              {loading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create candidate")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
