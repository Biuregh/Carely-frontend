import { useState } from "react";
import { createPatient } from "../../services/patients.js";
import { useNavigate } from "react-router";

export default function PatientQuickCreate({ onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
    notes: "",
    allergies: "",
    medication: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      setBusy(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        dob: form.dob, // "YYYY-MM-DD"
        phone: form.phone.trim(),
        notes: form.notes.trim(),
        allergies: form.allergies
          ? form.allergies
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        medication: form.medication
          ? form.medication
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      const p = await createPatient(payload);
      setMsg("Patient created.");
      onCreated?.(p);
      // hop straight to profile for editing
      navigate("/profile", { state: { patientId: p?._id } });
    } catch (e) {
      setMsg(e.message || "Failed to create patient.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 720 }}>
      {msg && (
        <div
          style={{
            background: "#f8f8f8",
            border: "1px solid #ddd",
            padding: 8,
          }}
        >
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="DOB"
          value={form.dob}
          onChange={(e) => set("dob", e.target.value)}
          required
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          required
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

      <div style={{ display: "flex", gap: 8 }}>
        <button disabled={busy}>{busy ? "Saving…" : "Create Patient"}</button>
      </div>
    </form>
  );
}
