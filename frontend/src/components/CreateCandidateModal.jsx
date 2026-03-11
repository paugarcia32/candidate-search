import { useState } from "react";

const emptyExperience = () => ({ company: "", role: "", start: "", end: "", description: "" });
const emptyEducation = () => ({ institution: "", degree: "", start: "", end: "" });
const emptyCertification = () => ({ name: "", issuer: "", year: "" });

const inputStyle = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "4px",
};

const sectionTitleStyle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "12px",
  marginTop: "24px",
  paddingBottom: "6px",
  borderBottom: "1px solid #f3f4f6",
};

const entryBoxStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "12px",
  marginBottom: "12px",
  position: "relative",
  background: "#fafafa",
};

const addBtnStyle = {
  padding: "5px 14px",
  border: "1px solid #2563eb",
  borderRadius: "6px",
  background: "#fff",
  color: "#2563eb",
  fontSize: "13px",
  cursor: "pointer",
  fontWeight: "600",
};

const removeBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "2px 8px",
  border: "1px solid #e5e7eb",
  borderRadius: "4px",
  background: "#fff",
  color: "#9ca3af",
  fontSize: "12px",
  cursor: "pointer",
};

function Field({ label, value, onChange, required, placeholder, type = "text", rows }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}

export default function CreateCandidateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    photo: "",
    summary: "",
  });
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
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
      const res = await fetch("/api/v1/candidates", {
        method: "POST",
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "28px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>New Candidate</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic info */}
          <Field label="Name" value={form.name} onChange={setField("name")} required placeholder="Full name" />
          <Field label="Summary" value={form.summary} onChange={setField("summary")} required placeholder="Professional summary..." rows={3} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Email" value={form.email} onChange={setField("email")} placeholder="email@example.com" type="email" />
            <Field label="Phone" value={form.phone} onChange={setField("phone")} placeholder="+1 555 000 0000" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Location" value={form.location} onChange={setField("location")} placeholder="City, Country" />
            <Field label="Photo URL" value={form.photo} onChange={setField("photo")} placeholder="https://..." />
          </div>

          {/* Experience */}
          <div style={sectionTitleStyle}>Experience</div>
          {experience.map((exp, i) => (
            <div key={i} style={entryBoxStyle}>
              <button type="button" style={removeBtnStyle} onClick={() => removeEntry(experience, setExperience, i)}>✕</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="Company" value={exp.company} onChange={(v) => updateEntry(experience, setExperience, i, "company", v)} placeholder="Company name" />
                <Field label="Role" value={exp.role} onChange={(v) => updateEntry(experience, setExperience, i, "role", v)} placeholder="Job title" />
                <Field label="Start (YYYY-MM)" value={exp.start} onChange={(v) => updateEntry(experience, setExperience, i, "start", v)} placeholder="2022-01" />
                <Field label="End (YYYY-MM)" value={exp.end} onChange={(v) => updateEntry(experience, setExperience, i, "end", v)} placeholder="2024-06 or leave blank" />
              </div>
              <Field label="Description" value={exp.description} onChange={(v) => updateEntry(experience, setExperience, i, "description", v)} placeholder="Role description..." rows={2} />
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={() => setExperience([...experience, emptyExperience()])}>
            + Add experience
          </button>

          {/* Education */}
          <div style={sectionTitleStyle}>Education</div>
          {education.map((edu, i) => (
            <div key={i} style={entryBoxStyle}>
              <button type="button" style={removeBtnStyle} onClick={() => removeEntry(education, setEducation, i)}>✕</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="Institution" value={edu.institution} onChange={(v) => updateEntry(education, setEducation, i, "institution", v)} placeholder="University name" />
                <Field label="Degree" value={edu.degree} onChange={(v) => updateEntry(education, setEducation, i, "degree", v)} placeholder="B.Sc. Computer Science" />
                <Field label="Start (YYYY-MM)" value={edu.start} onChange={(v) => updateEntry(education, setEducation, i, "start", v)} placeholder="2018-09" />
                <Field label="End (YYYY-MM)" value={edu.end} onChange={(v) => updateEntry(education, setEducation, i, "end", v)} placeholder="2022-06" />
              </div>
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={() => setEducation([...education, emptyEducation()])}>
            + Add education
          </button>

          {/* Certifications */}
          <div style={sectionTitleStyle}>Certifications</div>
          {certifications.map((cert, i) => (
            <div key={i} style={entryBoxStyle}>
              <button type="button" style={removeBtnStyle} onClick={() => removeEntry(certifications, setCertifications, i)}>✕</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "10px" }}>
                <Field label="Name" value={cert.name} onChange={(v) => updateEntry(certifications, setCertifications, i, "name", v)} placeholder="AWS Solutions Architect" />
                <Field label="Issuer" value={cert.issuer} onChange={(v) => updateEntry(certifications, setCertifications, i, "issuer", v)} placeholder="Amazon" />
                <Field label="Year" value={cert.year} onChange={(v) => updateEntry(certifications, setCertifications, i, "year", v)} placeholder="2023" type="number" />
              </div>
            </div>
          ))}
          <button type="button" style={addBtnStyle} onClick={() => setCertifications([...certifications, emptyCertification()])}>
            + Add certification
          </button>

          {/* Error */}
          {error && (
            <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "16px", marginBottom: 0 }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                background: "#fff",
                color: "#374151",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim() || !form.summary.trim()}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: "6px",
                background: loading || !form.name.trim() || !form.summary.trim() ? "#93c5fd" : "#2563eb",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading || !form.name.trim() || !form.summary.trim() ? "default" : "pointer",
              }}
            >
              {loading ? "Creating..." : "Create candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
