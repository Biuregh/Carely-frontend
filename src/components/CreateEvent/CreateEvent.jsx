import { useState } from "react";
import { create as createAppt } from "../../services/appointmentService.js";
import { searchPatients } from "../../services/patients.js";

const TYPES = [
  { id: "consult", label: "Consultation" },
  { id: "followup", label: "Follow-up" },
  { id: "other", label: "Other" },
];

const CreateEvent = ({ providerId = "" }) => {
  // basic fields
  const [type, setType] = useState(""); // we’ll send as "reason"
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // patient picker
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [patientId, setPatientId] = useState("");

  const [saving, setSaving] = useState(false);

  async function search() {
    try {
      const q = {};
      if (patientQuery.trim()) q.name = patientQuery.trim();
      const res = await searchPatients(q);
      setPatientResults(Array.isArray(res) ? res.slice(0, 20) : []);
    } catch {
      setPatientResults([]);
    }
  }

  function resetForm() {
    setType("");
    setDate("");
    setStart("");
    setEnd("");
    setPatientQuery("");
    setPatientResults([]);
    setPatientId("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // providerId must be chosen and not "ALL"
    const pid = providerId && providerId !== "ALL" ? providerId : "";
    if (!pid) {
      alert("Pick a provider first.");
      return;
    }
    if (!type || !date || !start || !end) {
      alert("Type, date, start and end are required.");
      return;
    }

    setSaving(true);
    try {
      await createAppt({
        providerId: pid,
        patientId: patientId || undefined,
        date,
        start,
        end,
        reason: type,
      });
      alert("Appointment created.");
      resetForm();
    } catch (err) {
      alert("Failed to create event: " + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 520 }}
      >
        <label>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select type</option>
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {/* Patient picker */}
        <div style={{ border: "1px solid #eee", padding: 8, borderRadius: 8 }}>
          <strong>Patient (optional)</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              type="text"
              placeholder="Search by name/email/phone"
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={search}>
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setPatientQuery("");
                setPatientResults([]);
                setPatientId("");
              }}
            >
              Clear
            </button>
          </div>

          {patientResults.length > 0 && (
            <div
              style={{
                marginTop: 8,
                maxHeight: 200,
                overflow: "auto",
                borderTop: "1px solid #eee",
                paddingTop: 8,
              }}
            >
              {patientResults.map((p) => (
                <label
                  key={p._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <input
                    type="radio"
                    name="patientPick"
                    checked={patientId === String(p._id)}
                    onChange={() => setPatientId(String(p._id))}
                  />
                  <span>
                    {p.name} · {p.email} · {p.phone}
                  </span>
                </label>
              ))}
            </div>
          )}

          {patientId && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
              Selected Patient ID: <code>{patientId}</code>
            </div>
          )}
        </div>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1 }}>
            Start
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>
          <label style={{ flex: 1 }}>
            End
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>
        </div>

        <button disabled={saving}>
          {saving ? "Creating…" : "Create Appointment"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
