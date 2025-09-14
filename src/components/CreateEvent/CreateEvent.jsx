import { useState } from "react";
import { create as createAppt } from "../../services/appointmentService.js";
import { searchPatients } from "../../services/patients.js";

const TYPES = [
  { id: "consult", label: "Consultation" },
  { id: "followup", label: "Follow-up" },
  { id: "other", label: "Other" },
];

const CreateEvent = ({ providerId = "" }) => {
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

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
  <div className="bg-white border rounded p-4 md:p-6">
    <h3 className="text-lg font-semibold text-teal-600 mb-4 text-center">
      Create Appointment
    </h3>

    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select type</option>
          {TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <strong className="block text-gray-700 mb-2">Patient (optional)</strong>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name/email/phone"
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={search}
            className="px-3 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setPatientQuery("");
              setPatientResults([]);
              setPatientId("");
            }}
            className="px-3 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>

        {patientResults.length > 0 && (
          <div className="mt-3 max-h-48 overflow-auto border-t border-gray-200 pt-2">
            {patientResults.map((p) => (
              <label
                key={p._id}
                className="flex items-center gap-2 mb-2 text-sm text-gray-700"
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
          <div className="mt-2 text-xs text-gray-500">
            Selected Patient ID: <code>{patientId}</code>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start
          </label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
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
            required
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Creating…" : "Create Appointment"}
      </button>
    </form>
  </div>
);
};

export default CreateEvent;
