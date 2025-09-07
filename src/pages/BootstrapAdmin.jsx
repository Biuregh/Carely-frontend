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

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setMsg("");
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
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
      } catch {
        // ignore decode errors, user will be reloaded on refresh
      }

      setMsg("Admin bootstrapped. You are now signed in.");
      navigate("/");
    } catch (err) {
      setMsg(err.message || "Failed to bootstrap admin.");
    }
  }

  return (
    <main style={{ padding: 16, maxWidth: 520 }}>
      <h1>Bootstrap Admin</h1>
      <p style={{ color: "#666", marginBottom: 12 }}>
        This is a one-time setup to create the first admin user.
      </p>

      {msg && (
        <div
          style={{
            background: "#f6f6f6",
            border: "1px solid #ddd",
            padding: 8,
            marginBottom: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Email
          <input
            type="email"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="admin@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            type={form.showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Passw0rd!"
            required
          />
        </label>
        <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="showPassword"
            checked={form.showPassword}
            onChange={onChange}
          />
          Show password
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Create Admin</button>
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </form>

      <p style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
        If an admin already exists, this will return an error. Use the Sign In
        page instead.
      </p>
    </main>
  );
}

export default BootstrapAdmin;
