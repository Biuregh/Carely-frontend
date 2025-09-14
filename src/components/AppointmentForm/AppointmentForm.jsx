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
        start,
        end,
        reason: type,
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
  <div className="bg-white border rounded p-4 md:p-6">
    <h3 className="text-lg font-semibold text-teal-600 mb-4 text-center">
      Appointment Details
    </h3>

    {!patient && (
      <p className="text-sm text-gray-500 mb-4 text-center">
        Please search for a patient first
      </p>
    )}

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Type
      </label>
      <select
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Doctor
      </label>
      <select
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Date
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start
        </label>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End
        </label>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>

    <button
      disabled={!canSchedule || saving}
      onClick={onSchedule}
      className="w-full bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {saving ? "Scheduling..." : "Schedule Appointment"}
    </button>

    {message && (
      <p className="text-sm text-gray-500 mt-3 text-center">{message}</p>
    )}
  </div>
);return
};

export default AppointmentForm;
