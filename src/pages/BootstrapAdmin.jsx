import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "../contexts/UserContext";

const API = import.meta.env.VITE_API_BASE;

function BootstrapAdmin() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    username: "",
    password: "",
    showPassword: false,
  });
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setMsg("");
    setIsError(false);
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setIsError(false);
    setSubmitting(true);

    try {
      const res = await fetch(`${API}/auth/bootstrap-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.err || data.error || res.statusText);
      }

      const { token } = data || {};
      if (!token) throw new Error("Missing token from server.");

      localStorage.setItem("token", token);
      try {
        const payload = JSON.parse(atob(token.split(".")[1])).payload;
        setUser(payload);
      } catch {}

      setMsg("Admin bootstrapped. You are now signed in.");
      navigate("/staff");
    } catch (err) {
      setMsg(err.message || "Failed to bootstrap admin.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-3xl bg-white shadow rounded-lg p-6 md:p-8">
      {/* Heading */}
      <h1 className="text-2xl font-semibold text-teal-600 mb-2 text-center">
        Bootstrap Admin
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        This is a one-time setup to create the first admin user.
      </p>

      {/* Message */}
      {msg && (
        <div
          className={`mb-6 rounded border px-4 py-3 text-sm ${
            isError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-teal-200 bg-teal-50 text-teal-700"
          }`}
          role="alert"
        >
          {msg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="grid gap-4 max-w-lg mx-auto">
        {/* Email */}
        <input
          id="username"
          type="email"
          name="username"
          value={form.username}
          onChange={onChange}
          placeholder="Email (e.g., admin@example.com)"
          required
          className="w-full rounded border border-gray-300 px-3 py-2 
                     focus:outline-none focus:ring-2 focus:ring-teal-500"
          autoComplete="username"
        />

        {/* Password */}
        <input
          id="password"
          type={form.showPassword ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password (e.g., Passw0rd!)"
          required
          className="w-full rounded border border-gray-300 px-3 py-2 
                     focus:outline-none focus:ring-2 focus:ring-teal-500"
          autoComplete="new-password"
        />

        {/* Show password */}
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
          <input
            type="checkbox"
            name="showPassword"
            checked={form.showPassword}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          Show password
        </label>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-white 
                        focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${submitting ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"}`}
          >
            {submitting ? "Creating…" : "Create Admin"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium 
                       bg-gray-100 text-gray-800 hover:bg-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>

      <p className="mt-6 text-xs text-gray-500 text-center">
        If an admin already exists, this will return an error. Use the Sign In page instead.
      </p>
    </div>
  </div>
);
}

export default BootstrapAdmin;