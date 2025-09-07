import { useState, useRef, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import ProviderPicker from "../components/ProviderPicker/ProviderPicker.jsx";
import {
  getEventsRange,
  deleteEvent,
  updateEvent,
} from "../services/gcalService";
import { UserContext } from "../contexts/UserContext";

function toRFC3339Local(dt) {
  const offMin = -dt.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const abs = Math.abs(offMin);
  const offH = String(Math.floor(abs / 60)).padStart(2, "0");
  const offM = String(abs % 60).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const mon = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  const H = String(dt.getHours()).padStart(2, "0");
  const M = String(dt.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mon}-${day}T${H}:${M}:00${sign}${offH}:${offM}`;
}

function dateFromLocalInputs(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  const [hh, mm] = timeStr.split(":").map((n) => parseInt(n, 10));
  if ([y, m, d, hh, mm].some((x) => Number.isNaN(x))) return null;
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function CalendarPage() {
  const { user } = useContext(UserContext);

  const [providerId, setProviderId] = useState(
    () => localStorage.getItem("providerId") || ""
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [selected, setSelected] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [editTimes, setEditTimes] = useState(false);
  const [startDateStr, setStartDateStr] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [endTimeStr, setEndTimeStr] = useState("");
  const [origStart, setOrigStart] = useState(null);
  const [origEnd, setOrigEnd] = useState(null);

  const calRef = useRef(null);

  const effectiveProviderId = user?.role === "provider" ? user._id : providerId;

  const saveProvider = (id) => {
    setProviderId(id);
    try {
      if (id) localStorage.setItem("providerId", id);
      else localStorage.removeItem("providerId");
    } catch {}
    const api = calRef.current?.getApi?.();
    if (api?.view) loadRange(api.view.currentStart, api.view.currentEnd);
    closeInspector();
  };

  async function loadRange(start, end) {
    setErr("");
    setLoading(true);
    try {
      if (!effectiveProviderId) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const data = await getEventsRange({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        providerId: effectiveProviderId,
      });
      const items = (data.events || []).map((ev) => ({
        id: ev.id,
        title: ev.summary || "(no title)",
        start: ev.start?.dateTime || ev.start?.date,
        end:
          ev.end?.dateTime ||
          ev.end?.date ||
          ev.start?.dateTime ||
          ev.start?.date,
        extendedProps: {
          description: ev.description || "",
          attendees: Array.isArray(ev.attendees)
            ? ev.attendees.map((a) => ({ email: a.email }))
            : [],
          htmlLink: ev.htmlLink || "",
        },
      }));
      setEvents(items);
    } catch (e) {
      setErr(e.message || "Failed to load events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function initInspectorFromEvent(fcEvent) {
    const ev = fcEvent;
    const start = ev.start;
    const end = ev.end || ev.start;
    setSelected({
      id: ev.id,
      title: ev.title,
      description: ev.extendedProps?.description || "",
      attendees: Array.isArray(ev.extendedProps?.attendees)
        ? ev.extendedProps.attendees
        : [],
      start,
      end,
      htmlLink: ev.extendedProps?.htmlLink || "",
    });
    setEditTitle(ev.title || "");
    setOrigStart(start ? new Date(start.getTime()) : null);
    setOrigEnd(end ? new Date(end.getTime()) : null);

    const sd = start
      ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(start.getDate()).padStart(2, "0")}`
      : "";
    const st = start
      ? `${String(start.getHours()).padStart(2, "0")}:${String(
          start.getMinutes()
        ).padStart(2, "0")}`
      : "";
    const ed = end
      ? `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(end.getDate()).padStart(2, "0")}`
      : sd;
    const et = end
      ? `${String(end.getHours()).padStart(2, "0")}:${String(
          end.getMinutes()
        ).padStart(2, "0")}`
      : st;

    setStartDateStr(sd);
    setStartTimeStr(st);
    setEndDateStr(ed);
    setEndTimeStr(et);
    setEditTimes(false);
    setActionMsg("");
  }

  function onEventClick(info) {
    info.jsEvent.preventDefault();
    initInspectorFromEvent(info.event);
  }

  function eventDidMount(arg) {
    const el = arg.el;
    el.style.cursor = "pointer";
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      initInspectorFromEvent(arg.event);
    });
  }

  function closeInspector() {
    setSelected(null);
    setEditTitle("");
    setActionMsg("");
    setEditTimes(false);
  }

  async function onDelete() {
    if (!selected) return;
    if (!window.confirm("Delete this event?")) return;
    setActionMsg("");
    try {
      await deleteEvent(effectiveProviderId, selected.id);
      await loadRange(
        calRef.current.getApi().view.currentStart,
        calRef.current.getApi().view.currentEnd
      );
      closeInspector(); // auto-close on success
    } catch (e) {
      setActionMsg(e.message || "Failed to delete.");
    }
  }

  async function onSaveInspector() {
    if (!selected) return;

    const payload = {
      summary: (editTitle || "").trim(),
      description: (selected.description || "").trim(),
      attendeeEmails: (selected.attendees || []).map((a) => a.email),
    };

    if (editTimes) {
      const newStart = dateFromLocalInputs(startDateStr, startTimeStr);
      const newEnd = dateFromLocalInputs(endDateStr, endTimeStr);
      if (!newStart || !newEnd) {
        setActionMsg("Please enter valid start/end date and time.");
        return;
      }
      if (newEnd <= newStart) {
        setActionMsg("End must be after start.");
        return;
      }
      const changedStart =
        !origStart || newStart.getTime() !== origStart.getTime();
      const changedEnd = !origEnd || newEnd.getTime() !== origEnd.getTime();
      if (changedStart || changedEnd) {
        payload.startISO = toRFC3339Local(newStart);
        payload.endISO = toRFC3339Local(newEnd);
      }
    }

    try {
      await updateEvent(effectiveProviderId, selected.id, payload);
      await loadRange(
        calRef.current.getApi().view.currentStart,
        calRef.current.getApi().view.currentEnd
      );
      closeInspector(); // auto-close on success
    } catch (e) {
      setActionMsg(e.message || "Failed to update.");
    }
  }

  async function onEventDropResize(changeInfo) {
    const ev = changeInfo.event;
    try {
      const startISO = toRFC3339Local(ev.start);
      const endISO = ev.end ? toRFC3339Local(ev.end) : startISO;
      await updateEvent(effectiveProviderId, ev.id, { startISO, endISO });
      if (selected?.id === ev.id) {
        initInspectorFromEvent(ev);
      }
    } catch (e) {
      changeInfo.revert();
      setActionMsg(e.message || "Failed to reschedule.");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Calendar</h2>

      {user?.role !== "provider" && (
        <div style={{ marginBottom: 8 }}>
          <ProviderPicker value={providerId} onChange={saveProvider} />
        </div>
      )}

      {err && <p style={{ color: "#b00020" }}>{err}</p>}

      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height="70vh"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        editable={true}
        events={events}
        datesSet={(arg) => loadRange(arg.start, arg.end)}
        eventClick={onEventClick}
        eventDidMount={eventDidMount}
        eventDrop={onEventDropResize}
        eventResize={onEventDropResize}
      />

      {selected && (
        <div style={{ marginTop: 12, border: "1px solid #ddd", padding: 12 }}>
          <h3>Edit Event</h3>
          <label>
            Title{" "}
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </label>
          <label>
            Description{" "}
            <input
              value={selected.description}
              onChange={(e) =>
                setSelected({ ...selected, description: e.target.value })
              }
            />
          </label>
          <label>
            Attendees{" "}
            <input
              value={(selected.attendees || []).map((a) => a.email).join(", ")}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  attendees: e.target.value
                    .split(",")
                    .map((s) => ({ email: s.trim() }))
                    .filter((a) => a.email),
                })
              }
            />
          </label>
          <div>
            <label>
              <input
                type="checkbox"
                checked={editTimes}
                onChange={(e) => setEditTimes(e.target.checked)}
              />{" "}
              Edit times
            </label>
            {editTimes && (
              <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                />
                <input
                  type="time"
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                />
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                />
                <input
                  type="time"
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                />
              </div>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={onSaveInspector}>Save</button>
            <button onClick={onDelete}>Delete</button>
            <button onClick={closeInspector}>Close</button>
          </div>
          {actionMsg && <p style={{ color: "#b00020" }}>{actionMsg}</p>}
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
