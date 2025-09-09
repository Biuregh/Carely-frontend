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
  // --- New patient form ---
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
      // reset minimal fields
      setForm((s) => ({ ...s, name: "", email: "", phone: "", dob: "" }));
    } catch (e) {
      setMsg(e.message || "Failed to create patient.");
    } finally {
      setSaving(false);
    }
  }

  // --- Today's agenda (by provider) ---
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <main style={{ padding: 16, maxWidth: 800 }}>
      <h2 style={{ marginBottom: 8 }}>Staff Dashboard</h2>

      {/* NEW PATIENT (no Quick Actions row anymore) */}
      <section style={{ marginTop: 12 }}>
        <h3 style={{ marginBottom: 8 }}>New Patient</h3>

        {msg && (
          <div
            style={{
              marginBottom: 10,
              padding: 8,
              border: "1px solid #ddd",
              background: "#f7f7f7",
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <input
              placeholder="mm/dd/yyyy"
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
          <input
            placeholder="Allergies (comma separated)"
            value={form.allergies}
            onChange={(e) => set("allergies", e.target.value)}
          />
          <input
            placeholder="Medication (comma separated)"
            value={form.medication}
            onChange={(e) => set("medication", e.target.value)}
          />

          <button
            onClick={createPatient}
            disabled={saving}
            style={{
              width: 160,
              background: "#2f9e8f",
              color: "white",
              borderRadius: 8,
              padding: "8px 12px",
              border: "none",
            }}
          >
            {saving ? "Creating…" : "Create Patient"}
          </button>
        </div>
      </section>

      {/* TODAY'S AGENDA */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Today&apos;s Agenda</h3>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            style={{ minWidth: 220 }}
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
          />

          <button
            onClick={refreshAgenda}
            disabled={loadingAgenda || !providerId}
            style={{
              background: "#2f9e8f",
              color: "white",
              borderRadius: 8,
              padding: "8px 12px",
              border: "none",
            }}
          >
            {loadingAgenda ? "Loading…" : "Refresh"}
          </button>
        </div>

        {agendaErr && (
          <div style={{ color: "crimson", marginTop: 8 }}>{agendaErr}</div>
        )}

        <ul style={{ marginTop: 12, paddingLeft: 16 }}>
          {agenda.length === 0 && <li>No events for selected day.</li>}
          {agenda.map((ev) => {
            const start = ev.start?.dateTime || ev.start?.date || "";
            const end = ev.end?.dateTime || ev.end?.date || "";
            return (
              <li key={ev.id} style={{ marginBottom: 6 }}>
                <strong>{ev.summary || "(no title)"}</strong> —{" "}
                {new Date(start).toLocaleString()} →{" "}
                {new Date(end).toLocaleString()}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
