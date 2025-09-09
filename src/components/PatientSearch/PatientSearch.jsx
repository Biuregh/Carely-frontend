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
    <div className="box">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h3 className="title">Patient Search</h3>
        {canCreate && (
          <button className="btn" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Close New Patient" : "New Patient"}
          </button>
        )}
      </div>

      {showCreate && (
        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            padding: 8,
            marginBottom: 12,
          }}
        >
          <PatientQuickCreate
            onCreated={(p) => {
              setShowCreate(false);
              // prefill and refresh results
              setName(p?.name || "");
              setEmail(p?.email || "");
              onSearch();
              onSelectPatient?.(p || null);
            }}
          />
        </div>
      )}

      <label className="label">Name</label>
      <input
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="label">DOB</label>
      <input
        className="input"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <label className="label">Email</label>
      <input
        className="input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="label">Phone</label>
      <input
        className="input"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className="row">
        <button className="btn" onClick={onSearch} disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </button>
        <button className="btn" onClick={clearAll}>
          Clear
        </button>
      </div>

      {patients.length > 0 && (
        <ul className="list">
          {patients.map((p) => (
            <li key={p._id} className="listItem" onClick={() => onPick(p)}>
              <input
                type="radio"
                name="patientPick"
                checked={selected?._id === p._id}
                onChange={() => onPick(p)}
              />
              <span className="itemText">
                {p.name} · {formatDOB(p.dob)} · {p.email} · {p.phone}
              </span>

              {Array.isArray(p.appointments) && p.appointments.length > 0 && (
                <div className="sublist">
                  {p.appointments.map((a) => (
                    <div key={a.id} className="subitem">
                      {new Date(a.startISO).toLocaleString()} —{" "}
                      {a.provider?.name || ""}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="hint">
        {selected ? `Selected: ${selected.name}` : "No patient selected"}
      </p>
    </div>
  );
};

export default PatientSearch;
