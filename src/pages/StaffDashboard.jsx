import { useEffect, useState } from "react";
import { listProviders } from "../services/userService.js";
import * as gcal from "../services/gcalService.js";
import { api } from "../services/api.js";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function StaffDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    notes: "",
    allergies: "",
    medication: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function createPatient() {
    setMsg("");
    if (!form.name || !form.email || !form.phone || !form.dob) {
      setMsg("Name, Email, Phone, and DOB are required.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        dob: new Date(form.dob).toISOString(),
        notes: form.notes || "",
        allergies: (form.allergies || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        medication: (form.medication || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const created = await api("/patients", { method: "POST", body: payload });
      setMsg(`Patient created: ${created.name} (ID: ${created._id})`);
      try {
        localStorage.setItem("patientId", String(created._id));
      } catch {}
      setForm((s) => ({ ...s, name: "", email: "", phone: "", dob: "" }));
    } catch (e) {
      setMsg(e.message || "Failed to create patient.");
    } finally {
      setSaving(false);
    }
  }

  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState("");
  const [day, setDay] = useState(todayStr());
  const [agenda, setAgenda] = useState([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [agendaErr, setAgendaErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await listProviders();
        const cleaned = (data || [])
          .filter((p) => p && p.active !== false && p.calendarId)
          .map((p) => ({
            id: String(p._id),
            name: p.displayName || p.username,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setProviders(cleaned);
        if (!providerId && cleaned.length) setProviderId(cleaned[0].id);
      } catch {
        setProviders([]);
      }
    })();
  }, []);

  async function refreshAgenda() {
    if (!providerId) {
      setAgenda([]);
      return;
    }
    try {
      setAgendaErr("");
      setLoadingAgenda(true);
      const data = await gcal.getAgenda({ day, providerId });
      setAgenda(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setAgendaErr(e.message || "Failed to load agenda.");
    } finally {
      setLoadingAgenda(false);
    }
  }

  return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-5xl bg-white shadow rounded-lg p-6 md:p-8">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-teal-600 mb-6 text-center">
        Staff Dashboard
      </h2>

      {/* New Patient */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">New Patient</h3>

        {msg && (
          <div
            className="mb-4 rounded border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700"
            role="alert"
          >
            {msg}
          </div>
        )}

        <div className="space-y-4 max-w-2xl">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Allergies */}
          <input
            placeholder="Allergies (comma separated)"
            value={form.allergies}
            onChange={(e) => set("allergies", e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Medication */}
          <input
            placeholder="Medication (comma separated)"
            value={form.medication}
            onChange={(e) => set("medication", e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Button */}
          <button
            onClick={createPatient}
            disabled={saving}
            className="w-40 rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Creating…" : "Create Patient"}
          </button>
        </div>
      </section>

      {/* TODAY'S AGENDA */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Today&apos;s Agenda
        </h3>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="min-w-[220px] rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            onClick={refreshAgenda}
            disabled={loadingAgenda || !providerId}
            className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingAgenda ? "Loading…" : "Refresh"}
          </button>
        </div>

        {agendaErr && (
          <div className="text-red-600 text-sm mb-3">{agendaErr}</div>
        )}

        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {agenda.length === 0 && <li>No events for selected day.</li>}
          {agenda.map((ev) => {
            const start = ev.start?.dateTime || ev.start?.date || "";
            const end = ev.end?.dateTime || ev.end?.date || "";
            return (
              <li key={ev.id}>
                <strong>{ev.summary || "(no title)"}</strong> —{" "}
                {new Date(start).toLocaleString()} →{" "}
                {new Date(end).toLocaleString()}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  </div>
);
}
