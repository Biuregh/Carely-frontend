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
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-4xl bg-white shadow rounded-lg p-6 md:p-8">

      <h2 className="text-2xl font-semibold text-teal-600 mb-6 text-center">
        Admin · Users
      </h2>

      <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4">
        <strong className="text-gray-800">Clinic Google:</strong>{" "}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={connectClinic}
            className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
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
            className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Create User
        </h3>

        <form onSubmit={createUser} className="space-y-4 max-w-lg">
   
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (username)
            </label>
            <input
              type="email"
              name="username"
              value={form.username}
              onChange={onChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              name="displayName"
              value={form.displayName}
              onChange={onChange}
              placeholder="John Smith, MD"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="provider">provider</option>
              <option value="reception">reception</option>
              <option value="admin">admin</option>
              <option value="patient">patient</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </form>

        {msg && (
          <p className="mt-3 text-sm text-gray-700 rounded border border-gray-200 bg-gray-50 px-3 py-2">
            {msg}
          </p>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-3">Providers</h3>
      <ul className="grid gap-3">
        {users.map((u) => (
          <li
            key={u._id}
            className="rounded border border-gray-200 p-4 bg-white"
          >
            <div className="text-gray-900">
              <strong>{u.displayName || u.username}</strong> — {u.role} —{" "}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ml-1
                  ${
                    u.active
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-red-50 text-red-700 ring-red-200"
                  }`}
              >
                {u.active ? "active" : "inactive"}
              </span>
            </div>

            <div className="mt-1 text-xs text-gray-600">
              Calendar:{" "}
              {u.calendarId ? (
                <code className="text-gray-800">{u.calendarId}</code>
              ) : (
                <em>(not set)</em>
              )}
            </div>

            <div className="mt-3">
              <button
                onClick={() => ensureCalendar(u._id)}
                className="px-3 py-2 rounded border border-teal-600 text-teal-700 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              >
                Ensure clinic calendar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
}

export default AdminUsers;
