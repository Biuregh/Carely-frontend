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
    <main>
      <h2>Appointment Manager</h2>

      <form
        onSubmit={onSearch}
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
          alignItems: "end",
        }}
      >
        <label style={{ display: "grid", gap: 4 }}>
          Patient
          <input
            value={inputPatient}
            onChange={(e) => setInputPatient(e.target.value)}
            placeholder="Type patient name"
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Provider
          <select
            value={inputProviderId}
            onChange={(e) => setInputProviderId(e.target.value)}
          >
            <option value="ALL">All Providers</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          From
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          To
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
          <button type="submit">Search</button>
          <button type="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </form>

      {err && (
        <div style={{ color: "crimson", marginTop: 8 }}>Error: {err}</div>
      )}

      <section style={{ marginTop: 16 }}>
        <div>
          <span>View: </span>
          <button onClick={() => setView("list")} disabled={view === "list"}>
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            disabled={view === "calendar"}
          >
            Calendar
          </button>
        </div>
      </section>

      {view === "list" && (
        <>
          <h3 style={{ marginTop: 16 }}>
            Upcoming Appointments ({upcoming.length})
          </h3>
          {upcoming.length === 0 && <div>No upcoming appointments.</div>}
          {upcoming.map((a) => (
            <AppointmentCard
              key={a.id}
              appt={a}
              onReschedule={onReschedule}
              onCancel={onCancel}
            />
          ))}

          <h3>Past Appointments ({past.length})</h3>
          {past.length === 0 && <div>No past appointments.</div>}
          {past.map((a) => (
            <AppointmentCard
              key={a.id}
              appt={a}
              onReschedule={onReschedule}
              onCancel={onCancel}
            />
          ))}
        </>
      )}

      {view === "calendar" && (
        <div style={{ marginTop: 16 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            editable={false}
            selectable={false}
            height="auto"
          />
        </div>
      )}
    </main>
  );
};

export default AppointmentManager;
