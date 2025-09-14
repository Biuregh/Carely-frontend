import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import PatientSearch from "../components/PatientSearch/PatientSearch.jsx";
import {
  getPatient,
  updatePatient,
  deactivatePatient,
  reactivatePatient,
  hardDeletePatient,
} from "../services/patients.js";
import { UserContext } from "../contexts/UserContext";

const PatientProfile = () => {
  const { user } = useContext(UserContext);
  const canEdit = user && (user.role === "admin" || user.role === "reception");

  const { state } = useLocation() || {};
  const incomingPid = state?.patientId || state?._id || "";

  const [pid, setPid] = useState("");
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    notes: "",
    allergies: [],
    medication: [],
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // when navigated with state.patientId (e.g., from quick-create), select it
  useEffect(() => {
    if (incomingPid && !pid) setPid(String(incomingPid));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingPid]);

  const set = (k, v) => setData((s) => ({ ...s, [k]: v }));

  const load = async (id = pid) => {
    if (!id) return;
    setLoading(true);
    setMsg("");
    try {
      const p = await getPatient(id);
      const { appointments: _ignore, ...rest } = p || {};
      const dobVal = rest?.dob
        ? new Date(rest.dob).toISOString().slice(0, 10)
        : "";
      setData({ ...rest, dob: dobVal });
    } catch (e) {
      setMsg(e.message || "Failed to load patient.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pid) load(pid);
  }, [pid]);

  const save = async (e) => {
    e?.preventDefault?.();
    if (!pid) {
      setMsg("Select a patient first.");
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

  return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="mx-auto max-w-6xl w-full p-6 text-center">
      <h2 className="text-2xl font-semibold text-teal-600 mb-6">Patient Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Find a Patient</h3>
          <p className="text-sm text-gray-600 mb-4">
            Search by name, DOB, email, or phone. Click a result to select.
          </p>
          <PatientSearch
            onSelectPatient={(p) => {
              setMsg("");
              setPid(p?._id ? String(p._id) : "");
            }}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 text-center">
          {!pid ? (
            <div className="text-gray-600">
              <p className="mb-3">No patient selected yet. Use the search on the left to pick one.</p>
              {msg && (
                <div className="mt-3 inline-block rounded border border-gray-300 bg-gray-50 text-gray-700 text-sm px-3 py-2">
                  {msg}
                </div>
              )}
            </div>
          ) : (
            <>
              {msg && (
                <div className="mb-4 inline-block rounded border border-teal-300 bg-teal-50 text-teal-800 text-sm px-3 py-2">
                  {msg}
                </div>
              )}

              <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              
                <div className="rounded-lg border-2 border-gray-300 bg-white p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={data.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Full Name"
                  />
                </div>

                <div className="rounded-lg border-2 border-gray-300 bg-white p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={data.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="Email"
                  />
                </div>

                <div className="rounded-lg border-2 border-gray-300 bg-white p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={data.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>

                <div className="rounded-lg border-2 border-gray-300 bg-white p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={data.dob}
                    onChange={(e) => set("dob", e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>


                <div className="rounded-lg border-2 border-gray-300 bg-white p-3 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={data.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Optional notes"
                    rows={3}
                  />
                </div>


                <div className="rounded-lg border-2 border-gray-300 bg-white p-3 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
                  <textarea
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={Array.isArray(data.allergies) ? data.allergies.join(", ") : data.allergies || ""}
                    onChange={(e) =>
                      set(
                        "allergies",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="e.g., Penicillin, Peanuts"
                    rows={2}
                  />
                </div>


                <div className="rounded-lg border-2 border-gray-300 bg-white p-3 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication (comma separated)</label>
                  <textarea
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={Array.isArray(data.medication) ? data.medication.join(", ") : data.medication || ""}
                    onChange={(e) =>
                      set(
                        "medication",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="e.g., Metformin, Lisinopril"
                    rows={2}
                  />
                </div>


                <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2 text-center">
                  <div className="text-sm text-gray-600 flex flex-col md:flex-row md:items-center gap-3 justify-center">
                    <span>
                      Status:{" "}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          data.active === false
                            ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                        }`}
                      >
                        {data.active === false ? "Inactive" : "Active"}
                      </span>
                    </span>
                    <span className="text-gray-400">(ID:&nbsp;<code className="text-gray-600">{pid}</code>)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      onClick={() => load(pid)}
                      disabled={loading}
                    >
                      {loading ? "Loading…" : "Reload"}
                    </button>

                    {canEdit && (
                      <button
                        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        disabled={loading}
                      >
                        Save Profile
                      </button>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <div className="md:col-span-2 flex flex-wrap justify-center md:justify-end gap-2 mt-4">
                    {data.active === false ? (
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        disabled={loading}
                        onClick={async () => {
                          setMsg(""); setLoading(true);
                          try {
                            const p = await reactivatePatient(pid);
                            const dobVal = p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "";
                            setData({ ...p, dob: dobVal });
                            setMsg("Patient reactivated.");
                          } catch (e) {
                            setMsg(e.message || "Failed to reactivate.");
                          } finally { setLoading(false); }
                        }}
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        disabled={loading}
                        onClick={async () => {
                          if (!confirm("Deactivate this patient?")) return;
                          setMsg(""); setLoading(true);
                          try {
                            const p = await deactivatePatient(pid);
                            const dobVal = p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "";
                            setData({ ...p, dob: dobVal });
                            setMsg("Patient deactivated.");
                          } catch (e) {
                            setMsg(e.message || "Failed to deactivate.");
                          } finally { setLoading(false); }
                        }}
                      >
                        Deactivate
                      </button>
                    )}

                    {user?.role === "admin" && (
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        disabled={loading}
                        onClick={async () => {
                          if (!confirm("This permanently deletes the patient. Continue?")) return;
                          setMsg(""); setLoading(true);
                          try {
                            await hardDeletePatient(pid);
                            setMsg("Patient deleted. Select another patient from search.");
                            setPid("");
                            setData({ name: "", email: "", phone: "", dob: "", notes: "", allergies: [], medication: [], active: true });
                          } catch (e) {
                            setMsg(e.message || "Failed to delete.");
                          } finally { setLoading(false); }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

};

export default PatientProfile;
