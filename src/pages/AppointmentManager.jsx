import { useEffect, useMemo, useState } from "react";
import AppointmentCard from "../components/AppointmentCard/AppointmentCard.jsx";
import {
  list as listAppointments,
  reschedule,
  cancel,
} from "../services/appointmentService.js";
import { listProviders } from "../services/userService.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function toISODate(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString();
}
function addDaysISO(iso, n) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function toLocalISO(dateStr, timeHHmm) {
  return new Date(`${dateStr}T${timeHHmm}:00`).toISOString();
}

const AppointmentManager = () => {
  const [inputPatient, setInputPatient] = useState("");
  const [inputProviderId, setInputProviderId] = useState("ALL");
  const [fromDate, setFromDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  const [appliedPatient, setAppliedPatient] = useState("");
  const [appliedProviderId, setAppliedProviderId] = useState("ALL");
  const [appliedFrom, setAppliedFrom] = useState(fromDate);
  const [appliedTo, setAppliedTo] = useState(toDate);

  const [items, setItems] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [view, setView] = useState("list");

  useEffect(() => {
    (async () => {
      try {
        const data = await listProviders();
        const cleaned = (data || [])
          .filter((p) => p && p.active !== false)
          .map((p) => ({
            id: String(p._id),
            name: p.displayName || p.username || "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setProviders(cleaned);

        const ids = new Set(cleaned.map((p) => p.id));
        if (inputProviderId !== "ALL" && !ids.has(inputProviderId))
          setInputProviderId("ALL");
        if (appliedProviderId !== "ALL" && !ids.has(appliedProviderId))
          setAppliedProviderId("ALL");
      } catch {
        setProviders([]);
      }
    })();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const term = appliedPatient.trim();
      const by = term ? "patient" : undefined;

      const timeMin = toISODate(appliedFrom);
      const timeMax = addDaysISO(toISODate(appliedTo), 1);

      const providerId =
        appliedProviderId !== "ALL" ? appliedProviderId : undefined;

      const data = await listAppointments({
        by,
        term,
        providerId,
        timeMin,
        timeMax,
        limit: 1000,
      });

      setItems(data);
    } catch (e) {
      setErr(e.message || "Failed to load appointments");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
  }, [appliedPatient, appliedProviderId, appliedFrom, appliedTo]);

  function onSearch(e) {
    e?.preventDefault?.();
    setAppliedPatient(inputPatient);
    setAppliedProviderId(inputProviderId);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  }

  const filtered = useMemo(() => {
    const t = appliedPatient.trim().toLowerCase();
    return items.filter((a) => {
      const okPatient = !t || (a.patient?.name || "").toLowerCase().includes(t);
      let okProvider = true;
      if (appliedProviderId !== "ALL") {
        okProvider = a.providerId
          ? String(a.providerId) === appliedProviderId
          : true;
      }
      return okPatient && okProvider;
    });
  }, [items, appliedPatient, appliedProviderId]);

  const now = Date.now();
  const upcoming = useMemo(() => {
    const up = filtered.filter((a) => new Date(a.endISO).getTime() >= now);
    up.sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
    return up;
  }, [filtered, now]);

  const past = useMemo(() => {
    const pa = filtered.filter((a) => new Date(a.endISO).getTime() < now);
    pa.sort((a, b) => new Date(b.startISO) - new Date(a.startISO));
    return pa;
  }, [filtered, now]);

  async function onReschedule(appt, form) {
    try {
      await reschedule(appt.id, {
        startISO: toLocalISO(form.date, form.start),
        endISO: toLocalISO(form.date, form.end),
      });
      setItems((prev) =>
        prev.map((a) =>
          a.id === appt.id
            ? {
                ...a,
                startISO: toLocalISO(form.date, form.start),
                endISO: toLocalISO(form.date, form.end),
              }
            : a
        )
      );
    } catch (e) {
      alert(e.message || "Failed to reschedule");
    }
  }

  async function onCancel(appt) {
    if (!confirm(`Cancel appointment ${appt.code}?`)) return;
    try {
      await cancel(appt.id);
      setItems((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: "Cancelled" } : a))
      );
    } catch (e) {
      alert(e.message || "Failed to cancel");
    }
  }

  const calendarEvents = useMemo(() => {
    return filtered.map((a) => ({
      id: a.id,
      title: `${a.patient?.name}${
        a.provider?.name ? " — " + a.provider.name : ""
      }`,
      start: a.startISO,
      end: a.endISO,
    }));
  }, [filtered]);

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-4xl bg-white shadow rounded-lg p-6 md:p-8">
    
      <h2 className="text-2xl font-semibold text-teal-600 mb-6 text-center">
        Admin · Users
      </h2>

      <div className="mb-8 rounded border-2 border-gray-300 bg-white p-4">
        <strong className="text-gray-800">Clinic Google</strong>
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
    
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
          Create User
        </h3>

        <form onSubmit={createUser} className="space-y-4 max-w-lg mx-auto">
         
          <input
            type="email"
            name="username"
            value={form.username}
            onChange={onChange}
            required
            placeholder="Email (username)"
            className="w-full rounded border border-gray-300 px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <input
            name="displayName"
            value={form.displayName}
            onChange={onChange}
            placeholder="Display Name (e.g., John Smith, MD)"
            className="w-full rounded border border-gray-300 px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="Password"
            className="w-full rounded border border-gray-300 px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="w-full rounded border border-gray-300 px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="provider">provider</option>
            <option value="reception">reception</option>
            <option value="admin">admin</option>
            <option value="patient">patient</option>
          </select>

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
              className="w-full px-4 py-2 rounded bg-teal-600 text-white 
                         hover:bg-teal-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </form>

        {msg && (
          <p className="mt-3 text-sm text-gray-700 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-center">
            {msg}
          </p>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
        Providers
      </h3>
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
                className="px-3 py-2 rounded border border-teal-600 text-teal-700 bg-white 
                           hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
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
};

export default AppointmentManager;
