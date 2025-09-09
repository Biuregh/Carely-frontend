import { useEffect, useMemo, useState } from "react";
import AppointmentCard from "../components/AppointmentCard/AppointmentCard.jsx";
import * as apis from "../services/appointmentService.js";
import { listProviders } from "../services/userService.js";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function AppointmentManager() {
  const [inputPatient, setInputPatient] = useState("");
  const [inputProviderId, setInputProviderId] = useState("ALL");

  const [appliedPatient, setAppliedPatient] = useState("");
  const [appliedProviderId, setAppliedProviderId] = useState("ALL");

  const [items, setItems] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [view, setView] = useState("list");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apis.listAll();
        setItems(data);
      } catch (e) {
        setErr(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await listProviders();
        const cleaned = (data || [])
          .filter((p) => p && p.calendarId && p.active !== false)
          .map((p) => ({
            id: String(p._id),
            name: p.displayName || p.username || "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setProviders(cleaned);

        const validIds = new Set(cleaned.map((p) => p.id));
        if (inputProviderId !== "ALL" && !validIds.has(inputProviderId)) {
          setInputProviderId("ALL");
        }
        if (appliedProviderId !== "ALL" && !validIds.has(appliedProviderId)) {
          setAppliedProviderId("ALL");
        }
      } catch {
        setProviders([]);
      }
    })();
  }, [inputProviderId, appliedProviderId]);

  function onSearch(e) {
    e?.preventDefault?.();
    setAppliedPatient(inputPatient);
    setAppliedProviderId(inputProviderId);
  }

  const filtered = useMemo(() => {
    const t = appliedPatient.trim().toLowerCase();
    return items.filter((a) => {
      const okPatient = !t || (a.patient?.name || "").toLowerCase().includes(t);
      let okProvider = true;
      if (appliedProviderId !== "ALL") {
        if (a.providerId) {
          okProvider = String(a.providerId) === appliedProviderId;
        } else {
          const sel = providers.find((p) => p.id === appliedProviderId);
          okProvider = sel ? (a.provider?.name || "") === sel.name : false;
        }
      }
      return okPatient && okProvider;
    });
  }, [items, appliedPatient, appliedProviderId, providers]);

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
      await apis.reschedule(appt.id, form);
      const toISO = (d, t) => new Date(`${d}T${t}:00`).toISOString();
      const updated = items.map((a) =>
        a.id === appt.id
          ? {
              ...a,
              startISO: toISO(form.date, form.start),
              endISO: toISO(form.date, form.end),
            }
          : a
      );
      setItems(updated);
    } catch (e) {
      alert(e.message || "Failed to reschedule");
    }
  }

  async function onCancel(appt) {
    if (!confirm(`Cancel appointment ${appt.code}?`)) return;
    try {
      await apis.cancel(appt.id);
      setItems(
        items.map((a) => (a.id === appt.id ? { ...a, status: "Cancelled" } : a))
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

      <form onSubmit={onSearch}>
        <label>
          Patient
          <input
            value={inputPatient}
            onChange={(e) => setInputPatient(e.target.value)}
            placeholder="Type patient name"
          />
        </label>

        <label>
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

        <button type="submit">Search</button>
      </form>

      {err && <div>Error: {err}</div>}
      {loading && <div>Loading…</div>}

      <section>
        <div>
          <span>View: </span>
          <button onClick={() => setView("list")}>List</button>
          <button onClick={() => setView("calendar")}>Calendar</button>
        </div>
      </section>

      {view === "list" && (
        <>
          <h3>Upcoming Appointments ({upcoming.length})</h3>
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
      )}
    </main>
  );
}

export default AppointmentManager;
