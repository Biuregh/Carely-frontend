import { useEffect, useState } from "react";
import { listProviders } from "../../services/userService.js";
import { schedulePatientAppointment } from "../../services/patients.js";

const TYPES = [
  { id: "consult", label: "Consultation" },
  { id: "followup", label: "Follow-up" },
  { id: "other", label: "Other" },
];

const AppointmentForm = ({ patient }) => {
  const [type, setType] = useState("");
  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await listProviders();
        const cleaned = (data || [])
          .filter((p) => p && p.active !== false)
          .map((p) => ({
            id: String(p._id),
            name: p.displayName || p.username,
          }));
        setProviders(cleaned);
      } catch {
        setProviders([]);
      }
    })();
  }, []);

  const canSchedule = !!(patient && type && providerId && date && start && end);

  const onSchedule = async () => {
    if (!canSchedule) return;
    setSaving(true);
    setMessage("");
    try {
      await schedulePatientAppointment(patient._id || patient.id, {
        providerId,
        date,
        start, // "HH:mm"
        end, // "HH:mm"
        reason: type, // optional; we store it as "reason"
      });
      setMessage("Appointment scheduled successfully.");
      setType("");
      setDate("");
      setProviderId("");
      setStart("");
      setEnd("");
    } catch (err) {
      setMessage(err.message || "Failed to schedule appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="box">
      <h3 className="title">Appointment Details</h3>
      {!patient && <p className="hint">Please search for a patient first</p>}

      <label className="label">Type</label>
      <select
        className="input"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">Select type</option>
        {TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <label className="label">Doctor</label>
      <select
        className="input"
        value={providerId}
        onChange={(e) => setProviderId(e.target.value)}
      >
        <option value="">Choose doctor</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <label className="label">Date</label>
      <input
        className="input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="row" style={{ display: "flex", gap: 8 }}>
        <label className="label" style={{ flex: 1 }}>
          Start
          <input
            className="input"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label className="label" style={{ flex: 1 }}>
          End
          <input
            className="input"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
      </div>

      <button
        className="btnPrimary"
        disabled={!canSchedule || saving}
        onClick={onSchedule}
      >
        {saving ? "Scheduling..." : "Schedule Appointment"}
      </button>

      {message && <p className="hint">{message}</p>}
    </div>
  );
};

export default AppointmentForm;
