import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { getPatient, updatePatient } from "../services/patients.js";
import { UserContext } from "../contexts/UserContext";

const PatientProfile = () => {
  const { user } = useContext(UserContext);
  // allow admin OR reception to edit
  const canEdit = user && (user.role === "admin" || user.role === "reception");

  const { state } = useLocation() || {};
  const statePid = state?.patientId || state?._id || null;

  const [pid, setPid] = useState(() => {
    const fromState = statePid ? String(statePid) : null;
    if (fromState) return fromState;
    try {
      return localStorage.getItem("patientId") || "";
    } catch {
      return "";
    }
  });

  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    notes: "",
    allergies: [],
    medication: [],
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k, v) => setData((s) => ({ ...s, [k]: v }));

  const load = async () => {
    if (!pid) {
      setMsg("No patient selected yet.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const p = await getPatient(pid); // { ...patient, appointments: [...] }
      const { appointments: _ignore, ...rest } = p || {};
      const dobVal = rest?.dob
        ? new Date(rest.dob).toISOString().slice(0, 10)
        : "";
      setData({ ...rest, dob: dobVal });
      try {
        localStorage.setItem("patientId", String(pid));
      } catch {}
    } catch (e) {
      setMsg(e.message || "Failed to load patient.");
    } finally {
      setLoading(false);
    }
  };

  const save = async (e) => {
    e?.preventDefault?.();
    if (!pid) {
      setMsg("No patient selected.");
      return;
    }
    if (!canEdit) {
      setMsg("You don't have permission to edit this profile.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const payload = { ...data };
      // convert DOB back to ISO if present
      if (payload.dob) {
        const d = new Date(payload.dob);
        if (!isNaN(d.getTime())) payload.dob = d.toISOString();
      }
      const updated = await updatePatient(pid, payload);
      const dobVal = updated?.dob
        ? new Date(updated.dob).toISOString().slice(0, 10)
        : "";
      setData({ ...(updated || payload), dob: dobVal });
      setMsg("Profile saved.");
    } catch (e) {
      setMsg(e.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow rounded p-8">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          Patient Profile
        </h2>

        {msg && (
          <div
            style={{
              marginBottom: 12,
              padding: 8,
              border: "1px solid #ddd",
              background: "#f9f9f9",
            }}
          >
            {msg}
          </div>
        )}

        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Full Name"
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Phone"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            type="date"
            placeholder="YYYY-MM-DD"
            value={data.dob}
            onChange={(e) => set("dob", e.target.value)}
          />

          <textarea
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Notes"
            value={data.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Allergies (comma separated)"
            value={
              Array.isArray(data.allergies)
                ? data.allergies.join(", ")
                : data.allergies || ""
            }
            onChange={(e) =>
              set(
                "allergies",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
          <textarea
            className="border rounded px-3 py-2 md:col-span-2"
            placeholder="Medication (comma separated)"
            value={
              Array.isArray(data.medication)
                ? data.medication.join(", ")
                : data.medication || ""
            }
            onChange={(e) =>
              set(
                "medication",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />

          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="bg-gray-200 rounded px-4 py-2"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Loading…" : "Reload"}
            </button>

            {canEdit && (
              <button
                className="bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 transition-colors"
                disabled={loading}
              >
                Save Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
