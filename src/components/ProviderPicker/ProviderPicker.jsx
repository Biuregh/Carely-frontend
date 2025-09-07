import { useEffect, useState, useContext } from "react";
import { listProviders } from "../../services/userService";
import { UserContext } from "../../contexts/UserContext";

function ProviderPicker({ value, onChange }) {
  const { user } = useContext(UserContext);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (user?.role === "provider") {
        onChange?.(user._id);
        return;
      }
      try {
        const data = await listProviders();
        if (ignore) return;
        setProviders(data || []);

        // If we have a stored providerId not in the fresh list, clear it
        if (value && !(data || []).some(p => String(p._id) === String(value))) {
          onChange?.(""); // clear invalid selection
          // also clear persisted key (Connected.jsx persists it)
          try { localStorage.removeItem("providerId"); } catch {}
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => { ignore = true; };
  }, [user, onChange, value]);

  if (user?.role === "provider") {
    return <p><em>Booking as: {user.displayName || user.username}</em></p>;
  }

  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      Provider:&nbsp;
      <select value={value || ""} onChange={(e) => onChange?.(e.target.value)}>
        <option value="" disabled>Select a provider…</option>
        {providers.map((p) => (
          <option key={p._id} value={p._id}>
            {(p.displayName || p.username)} {p.active === false ? "(inactive)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ProviderPicker;
