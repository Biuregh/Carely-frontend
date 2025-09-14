import { useEffect, useState, useContext } from "react";
import { listProviders } from "../../services/userService.js";
import { UserContext } from "../../contexts/UserContext";

function ProviderPicker({ value, onChange, allowAll = false }) {
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

        const cleaned = (data || [])
          .filter((p) => p && p.active !== false)
          .map((p) => ({
            id: String(p._id),
            name: p.displayName || p.username || "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setProviders(cleaned);

        const valid = new Set(cleaned.map((p) => p.id));

        // If ALL leaked in from another page but this picker doesn't allow it, reset to blank
        if (!allowAll && value === "ALL") {
          onChange?.("");
          try {
            localStorage.removeItem("providerId");
          } catch {}
          return;
        }

        // If value is not valid, reset to ALL (if allowed) or blank
        if (value && value !== "ALL" && !valid.has(String(value))) {
          onChange?.(allowAll ? "ALL" : "");
          try {
            localStorage.removeItem("providerId");
          } catch {}
        }

        if (!value && allowAll) onChange?.("ALL");
      } catch (e) {
        console.error(e);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [user, value, allowAll, onChange]);

  if (user?.role === "provider") {
    return (
      <p>
        <em>Booking as: {user.displayName || user.username}</em>
      </p>
    );
  }

  return (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Provider
    </label>
    <select
      value={value || (allowAll ? "ALL" : "")}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full rounded border border-gray-300 px-3 py-2 
                 focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      {allowAll && <option value="ALL">All Providers</option>}
      {!allowAll && (
        <option value="" disabled>
          Select a provider…
        </option>
      )}
      {providers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  </div>
);
}

export default ProviderPicker;
