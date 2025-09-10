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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          Patient Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-medium mb-2">Find a Patient</h3>
            <p className="text-sm text-gray-600 mb-3">
              Search by name, DOB, email, or phone. Click a result to select.
            </p>
            <PatientSearch
              onSelectPatient={(p) => {
                setMsg("");
                setPid(p?._id ? String(p._id) : "");
              }}
            />
          </div>

          <div className="bg-white shadow rounded p-6">
            {!pid ? (
              <div className="text-gray-600">
                <p className="mb-2">
                  No patient selected yet. Use the search on the left to pick
                  one.
                </p>
                {msg && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 8,
                      border: "1px solid #ddd",
                      background: "#f9f9f9",
                    }}
                  >
                    {msg}
                  </div>
                )}
              </div>
            ) : (
              <>
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

                <form
                  onSubmit={save}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
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

                  <div className="md:col-span-2 flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-600 flex items-center gap-3">
                      <span>
                        Status:{" "}
                        <strong>
                          {data.active === false ? "Inactive" : "Active"}
                        </strong>
                      </span>
                      <span className="text-gray-400">
                        (ID:&nbsp;<code>{pid}</code>)
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bg-gray-200 rounded px-4 py-2"
                        onClick={() => load(pid)}
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
                  </div>

                  {canEdit && (
                    <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                      {data.active === false ? (
                        <button
                          type="button"
                          className="bg-teal-600 text-white rounded px-4 py-2"
                          disabled={loading}
                          onClick={async () => {
                            setMsg("");
                            setLoading(true);
                            try {
                              const p = await reactivatePatient(pid);
                              const dobVal = p?.dob
                                ? new Date(p.dob).toISOString().slice(0, 10)
                                : "";
                              setData({ ...p, dob: dobVal });
                              setMsg("Patient reactivated.");
                            } catch (e) {
                              setMsg(e.message || "Failed to reactivate.");
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="bg-yellow-600 text-white rounded px-4 py-2"
                          disabled={loading}
                          onClick={async () => {
                            if (!confirm("Deactivate this patient?")) return;
                            setMsg("");
                            setLoading(true);
                            try {
                              const p = await deactivatePatient(pid);
                              const dobVal = p?.dob
                                ? new Date(p.dob).toISOString().slice(0, 10)
                                : "";
                              setData({ ...p, dob: dobVal });
                              setMsg("Patient deactivated.");
                            } catch (e) {
                              setMsg(e.message || "Failed to deactivate.");
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Deactivate
                        </button>
                      )}

                      {user?.role === "admin" && (
                        <button
                          type="button"
                          className="bg-red-600 text-white rounded px-4 py-2"
                          disabled={loading}
                          onClick={async () => {
                            if (
                              !confirm(
                                "This permanently deletes the patient. Continue?"
                              )
                            )
                              return;
                            setMsg("");
                            setLoading(true);
                            try {
                              await hardDeletePatient(pid);
                              setMsg(
                                "Patient deleted. Select another patient from search."
                              );
                              setPid("");
                              setData({
                                name: "",
                                email: "",
                                phone: "",
                                dob: "",
                                notes: "",
                                allergies: [],
                                medication: [],
                                active: true,
                              });
                            } catch (e) {
                              setMsg(e.message || "Failed to delete.");
                            } finally {
                              setLoading(false);
                            }
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
