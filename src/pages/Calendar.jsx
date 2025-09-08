import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import ProviderPicker from "../components/ProviderPicker/ProviderPicker.jsx";
import * as gcal from "../services/gcalService.js";
import {
  TZ,
  toLocalRFC3339NoZ,
  toDateStr,
  toTimeStr,
} from "../utils/datetime.js";

function mapGoogleToFC(googleEvent) {
  const start = googleEvent.start?.dateTime || googleEvent.start?.date || null;
  const end = googleEvent.end?.dateTime || googleEvent.end?.date || null;
  const allDay = Boolean(
    googleEvent.start?.date && !googleEvent.start?.dateTime
  );
  return {
    id: googleEvent.id,
    title: googleEvent.summary || "(no title)",
    start,
    end,
    allDay,
    extendedProps: {
      description: googleEvent.description || "",
      location: googleEvent.location || "",
    },
  };
}

function CalendarPage() {
  const [providerId, setProviderId] = useState(
    () => localStorage.getItem("providerId") || ""
  );
  const calRef = useRef(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({
    summary: "",
    description: "",
    location: "",
    date: "",
    start: "",
    end: "",
    changeTime: false,
  });

  useEffect(() => {
    if (providerId) localStorage.setItem("providerId", providerId);
    else localStorage.removeItem("providerId");
  }, [providerId]);

  function refetchCalendar() {
    const api = calRef.current?.getApi?.();
    if (api) api.refetchEvents();
  }

  async function fetchGoogleRange(info, successCallback, failureCallback) {
    try {
      if (!providerId) {
        successCallback([]);
        return;
      }
      const data = await gcal.getEventsRange({
        timeMin: info.start.toISOString(),
        timeMax: info.end.toISOString(),
        providerId,
      });
      const items = Array.isArray(data.items) ? data.items : [];
      successCallback(items.map(mapGoogleToFC));
    } catch (err) {
      failureCallback(err);
    }
  }

  async function onEventDropResize(changeInfo) {
    const ev = changeInfo.event;
    try {
      if (!providerId) throw new Error("Pick a provider first.");
      setBusy(true);
      await gcal.updateEvent(providerId, ev.id, {
        start: { dateTime: toLocalRFC3339NoZ(ev.start), timeZone: TZ },
        end: ev.end
          ? { dateTime: toLocalRFC3339NoZ(ev.end), timeZone: TZ }
          : undefined,
      });
      setBusy(false);
    } catch (e) {
      setBusy(false);
      changeInfo.revert();
      alert(e.message || "Failed to update event");
    }
  }

  function onEventClick(clickInfo) {
    const ev = clickInfo.event;
    const start = ev.start ? new Date(ev.start) : null;
    const end = ev.end ? new Date(ev.end) : start;

    setEditId(ev.id);
    setForm({
      summary: ev.title || "",
      description: ev.extendedProps?.description || "",
      location: ev.extendedProps?.location || "",
      date: start ? toDateStr(start) : "",
      start: start ? toTimeStr(start) : "",
      end: end ? toTimeStr(end) : "",
      changeTime: false,
    });
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!providerId || !editId) return;
    try {
      setBusy(true);
      const updates = {
        summary: form.summary,
        description: form.description,
        location: form.location,
      };
      if (form.changeTime) {
        updates.start = {
          dateTime: `${form.date}T${form.start}:00`,
          timeZone: TZ,
        };
        updates.end = { dateTime: `${form.date}T${form.end}:00`, timeZone: TZ };
      }
      await gcal.updateEvent(providerId, editId, updates);
      setBusy(false);
      setPanelOpen(false);
      refetchCalendar();
    } catch (e) {
      setBusy(false);
      alert(e.message || "Failed to save");
    }
  }

  async function handleDelete() {
    if (!providerId || !editId) return;
    const ok = confirm(`Delete "${form.summary || "(no title)"}"?`);
    if (!ok) return;
    try {
      setBusy(true);
      await gcal.deleteEvent(providerId, editId);
      setBusy(false);
      setPanelOpen(false);
      refetchCalendar();
    } catch (e) {
      setBusy(false);
      alert(e.message || "Failed to delete");
    }
  }

  useEffect(() => {
    refetchCalendar();
  }, [providerId]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 12 }}>
      <h2>Calendar</h2>

      <ProviderPicker value={providerId} onChange={setProviderId} />

      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        editable={true}
        selectable={false}
        eventOverlap={true}
        events={fetchGoogleRange}
        eventDrop={onEventDropResize}
        eventResize={onEventDropResize}
        eventClick={onEventClick}
        height="auto"
      />

      {panelOpen && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <strong>Edit Appointment</strong>
            <button onClick={() => setPanelOpen(false)} disabled={busy}>
              Close
            </button>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <label>
              Title
              <input
                type="text"
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
              />
            </label>

            <label>
              Notes (optional)
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </label>

            <label>
              Location (optional)
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </label>

            <label
              style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              <input
                type="checkbox"
                checked={form.changeTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, changeTime: e.target.checked }))
                }
              />
              Change time?
            </label>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                opacity: form.changeTime ? 1 : 0.6,
              }}
            >
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  disabled={!form.changeTime}
                />
              </label>
              <label>
                Start
                <input
                  type="time"
                  value={form.start}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start: e.target.value }))
                  }
                  disabled={!form.changeTime}
                />
              </label>
              <label>
                End
                <input
                  type="time"
                  value={form.end}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end: e.target.value }))
                  }
                  disabled={!form.changeTime}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={handleSave} disabled={busy}>
                Save
              </button>
              <button onClick={handleDelete} disabled={busy}>
                Delete
              </button>
            </div>

            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Tip: you can also drag/resize the event directly on the calendar
              to change time.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
