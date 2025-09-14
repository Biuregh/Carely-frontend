import { useContext, useState } from "react";
import { searchPatients } from "../../services/patients.js";
import { UserContext } from "../../contexts/UserContext";
import PatientQuickCreate from "../PatientQuickCreate/PatientQuickCreate.jsx";

const PatientSearch = ({ onSelectPatient }) => {
  const { user } = useContext(UserContext);
  const canCreate =
    user && (user.role === "admin" || user.role === "reception");

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const onSearch = async () => {
    setSearching(true);
    setPatients([]);
    setSelected(null);
    onSelectPatient?.(null);
    try {
      const res = await searchPatients({
        name,
        dob,
        email,
        phone,
        withAppointments: true,
      });
      setPatients(Array.isArray(res) ? res : []);
    } finally {
      setSearching(false);
    }
  };

  const onPick = (p) => {
    setSelected(p);
    onSelectPatient?.(p);
  };

  const clearAll = () => {
    setName("");
    setDob("");
    setEmail("");
    setPhone("");
    setPatients([]);
    setSelected(null);
    onSelectPatient?.(null);
  };

  const formatDOB = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "-");

 return (
  <div className="bg-white border rounded p-4 md:p-6">
 
    <div className="mb-4 flex items-baseline justify-between">
      <h3 className="text-lg font-semibold text-teal-600">Patient Search</h3>

      {canCreate && (
        <button
          className="px-3 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Close New Patient" : "New Patient"}
        </button>
      )}
    </div>

    {showCreate && (
      <div className="mb-4 rounded-lg border-2 border-gray-300 bg-white p-4">
        <PatientQuickCreate
          onCreated={(p) => {
            setShowCreate(false);
            setName(p?.name || "");
            setEmail(p?.email || "");
            onSearch();
            onSelectPatient?.(p || null);
          }}
        />
      </div>
    )}

    <div className="space-y-3">
      <input
        placeholder="Full Name"
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="date"
        placeholder="Date of Birth"
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Phone Number"
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <button
        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onSearch}
        disabled={searching}
      >
        {searching ? "Searching..." : "Search"}
      </button>
      <button
        className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
        onClick={clearAll}
      >
        Clear
      </button>
    </div>

    {patients.length > 0 && (
      <ul className="mt-4 divide-y rounded border border-gray-200">
        {patients.map((p) => (
          <li
            key={p._id}
            className="flex flex-col gap-2 p-3 hover:bg-teal-50 cursor-pointer"
            onClick={() => onPick(p)}
          >
            <div className="flex items-start gap-2">
              <input
                type="radio"
                name="patientPick"
                checked={selected?._id === p._id}
                onChange={() => onPick(p)}
                className="mt-1"
              />
              <span className="text-sm text-gray-800">
                {p.name} · {formatDOB(p.dob)} · {p.email} · {p.phone}
              </span>
            </div>

            {Array.isArray(p.appointments) && p.appointments.length > 0 && (
              <div className="ml-6 rounded bg-gray-50 p-2 text-xs text-gray-600">
                {p.appointments.map((a) => (
                  <div key={a.id} className="py-0.5">
                    {new Date(a.startISO).toLocaleString()} — {a.provider?.name || ""}
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    )}

    <p className="mt-3 text-center text-sm text-gray-500">
      {selected ? `Selected: ${selected.name}` : "No patient selected"}
    </p>
  </div>
);
};

export default PatientSearch;
