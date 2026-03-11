import { useState } from "react";

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
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] dark:bg-[rgba(0,0,0,0.65)] z-[1000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-7 relative shadow-modal">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold m-0">{isEdit ? "Edit Candidate" : "New Candidate"}</h2>
          <button
            onClick={onClose}
            className="theme-toggle text-foreground-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic info */}
          <Field label="Name" value={form.name} onChange={setField("name")} required placeholder="Full name" />
          <Field label="Summary" value={form.summary} onChange={setField("summary")} required placeholder="Professional summary..." rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={form.email} onChange={setField("email")} placeholder="email@example.com" type="email" />
            <Field label="Phone" value={form.phone} onChange={setField("phone")} placeholder="+1 555 000 0000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" value={form.location} onChange={setField("location")} placeholder="City, Country" />
            <Field label="Photo URL" value={form.photo} onChange={setField("photo")} placeholder="https://..." />
          </div>

          {/* Experience */}
          <div className="text-[15px] font-bold text-foreground mb-3 mt-6 pb-1.5 border-b border-border-subtle">
            Experience
          </div>
          {experience.map((exp, i) => (
            <div key={i} className="border border-border rounded-lg p-3 mb-3 relative bg-bg-subtle">
              <button
                type="button"
                className="absolute top-2.5 right-2.5 px-2 py-0.5 border border-border rounded text-[11px] text-foreground-muted bg-surface cursor-pointer hover:text-danger hover:border-danger-border transition-colors"
                onClick={() => removeEntry(experience, setExperience, i)}
              >
                ✕
              </button>
              <div className="grid grid-cols-2 gap-2.5">
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
          <div className="text-[15px] font-bold text-foreground mb-3 mt-6 pb-1.5 border-b border-border-subtle">
            Education
          </div>
          {education.map((edu, i) => (
            <div key={i} className="border border-border rounded-lg p-3 mb-3 relative bg-bg-subtle">
              <button
                type="button"
                className="absolute top-2.5 right-2.5 px-2 py-0.5 border border-border rounded text-[11px] text-foreground-muted bg-surface cursor-pointer hover:text-danger hover:border-danger-border transition-colors"
                onClick={() => removeEntry(education, setEducation, i)}
              >
                ✕
              </button>
              <div className="grid grid-cols-2 gap-2.5">
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
          <div className="text-[15px] font-bold text-foreground mb-3 mt-6 pb-1.5 border-b border-border-subtle">
            Certifications
          </div>
          {certifications.map((cert, i) => (
            <div key={i} className="border border-border rounded-lg p-3 mb-3 relative bg-bg-subtle">
              <button
                type="button"
                className="absolute top-2.5 right-2.5 px-2 py-0.5 border border-border rounded text-[11px] text-foreground-muted bg-surface cursor-pointer hover:text-danger hover:border-danger-border transition-colors"
                onClick={() => removeEntry(certifications, setCertifications, i)}
              >
                ✕
              </button>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr 80px" }}>
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
          {error && (
            <p className="text-danger text-[13px] mt-4 mb-0">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 mt-6">
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
