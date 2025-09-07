import { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const API = import.meta.env.VITE_API_BASE;

function AdminUsers() {
  const { user } = useContext(UserContext);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "provider",
    displayName: "",
    active: true,
  });
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };

  const loadProviders = async () => {
    const res = await fetch(`${API}/users/providers`, {
      credentials: "include",
      headers: tokenHeader,
    });
    const data = await res.json();
    if (res.ok) setUsers(data);
  };

  useEffect(() => {
    if (user?.role === "admin") loadProviders();
  }, [user]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const createUser = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        displayName: (form.displayName || "").trim() || form.username,
        active: !!form.active,
      };
      const res = await fetch(`${API}/users`, {
        method: "POST",
        credentials: "include",
        headers: tokenHeader,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.err || "Failed to create user");
      setMsg(`Created ${data.displayName || data.username} (${data.role})`);
      setForm({
        username: "",
        password: "",
        role: "provider",
        displayName: "",
        active: true,
      });
      loadProviders();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const ensureCalendar = async (id) => {
    setMsg("");
    try {
      const res = await fetch(
        `${API}/api/gcal/providers/${id}/ensure-calendar`,
        {
          method: "POST",
          headers: tokenHeader,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to ensure calendar");
      setMsg(`Calendar ready for provider. ID: ${data.calendarId}`);
      loadProviders();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const connectClinic = async () => {
    const res = await fetch(`${API}/oauth/google/app/url`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text();
      alert(`Failed to start Google connect: ${text || res.statusText}`);
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <main style={{ padding: 16 }}>
      <h2>Admin · Users</h2>

      <div style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd" }}>
        <strong>Clinic Google:</strong>{" "}
        <button onClick={connectClinic} style={{ marginRight: 8 }}>
          Connect
        </button>
        <button
          onClick={async () => {
            const res = await fetch(`${API}/oauth/google/app/disconnect`, {
              method: "POST",
              headers: tokenHeader,
              credentials: "include",
            });
            if (res.ok) setMsg("Clinic Google disconnected");
          }}
        >
          Disconnect
        </button>
      </div>

      <form
        onSubmit={createUser}
        style={{ display: "grid", gap: 8, maxWidth: 520 }}
      >
        <label>
          Email (username)
          <input
            type="email"
            name="username"
            value={form.username}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Display Name
          <input
            name="displayName"
            value={form.displayName}
            onChange={onChange}
            placeholder="John Smith, MD"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Role
          <select name="role" value={form.role} onChange={onChange}>
            <option value="provider">provider</option>
            <option value="reception">reception</option>
            <option value="admin">admin</option>
            <option value="patient">patient</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={onChange}
          />{" "}
          Active
        </label>

        <button type="submit">Create User</button>
      </form>

      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}

      <h3 style={{ marginTop: 24 }}>Providers</h3>
      <ul style={{ display: "grid", gap: 8 }}>
        {users.map((u) => (
          <li key={u._id} style={{ border: "1px solid #eee", padding: 8 }}>
            <div>
              <strong>{u.displayName || u.username}</strong> — {u.role} —{" "}
              {u.active ? "active" : "inactive"}
            </div>
            <div style={{ fontSize: 13, color: "#555" }}>
              Calendar:{" "}
              {u.calendarId ? <code>{u.calendarId}</code> : <em>(not set)</em>}
            </div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => ensureCalendar(u._id)}>
                Ensure clinic calendar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default AdminUsers;
