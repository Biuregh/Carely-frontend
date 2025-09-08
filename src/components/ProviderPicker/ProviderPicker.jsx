import { useEffect, useState, useContext } from "react";
import { listProviders } from "../../services/userService";
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
        setProviders(data || []);

        if (
          value &&
          value !== "ALL" &&
          !(data || []).some((p) => String(p._id) === String(value))
        ) {
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
  }, [user, onChange, value, allowAll]);

  if (user?.role === "provider") {
    return (
      <p>
        <em>Booking as: {user.displayName || user.username}</em>
      </p>
    );
  }

  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      Provider:&nbsp;
      <select
        value={value || (allowAll ? "ALL" : "")}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {allowAll && <option value="ALL">All Providers</option>}
        {!allowAll && (
          <option value="" disabled>
            Select a provider…
          </option>
        )}
        {providers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.displayName || p.username}{" "}
            {p.active === false ? "(inactive)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ProviderPicker;
