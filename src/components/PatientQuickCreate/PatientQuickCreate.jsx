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
        dob: form.dob, 
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
      
      navigate("/profile", { state: { patientId: p?._id } });
    } catch (e) {
      setMsg(e.message || "Failed to create patient.");
    } finally {
      setBusy(false);
    }
  }

  return (
  <form onSubmit={submit} className="space-y-4 max-w-2xl">
    
    {msg && (
      <div className="rounded border border-gray-200 bg-gray-50 text-gray-700 text-sm px-3 py-2">
        {msg}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        required
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        required
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="date"
        placeholder="DOB"
        value={form.dob}
        onChange={(e) => set("dob", e.target.value)}
        required
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => set("phone", e.target.value)}
        required
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>

    <textarea
      placeholder="Notes (optional)"
      value={form.notes}
      onChange={(e) => set("notes", e.target.value)}
      className="w-full min-h-24 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
    />

    <input
      placeholder="Allergies (comma separated)"
      value={form.allergies}
      onChange={(e) => set("allergies", e.target.value)}
      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
    />

    <input
      placeholder="Medication (comma separated)"
      value={form.medication}
      onChange={(e) => set("medication", e.target.value)}
      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
    />

    <div className="flex gap-2">
      <button
        disabled={busy}
        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? "Saving…" : "Create Patient"}
      </button>
    </div>
  </form>
);
}
