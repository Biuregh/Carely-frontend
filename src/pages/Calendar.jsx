import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import ProviderPicker from "../components/ProviderPicker/ProviderPicker.jsx";
import * as gcal from "../services/gcalService.js";
import { listProviders } from "../services/userService.js";
import {
  TZ,
  toLocalRFC3339NoZ,
  toDateStr,
  toTimeStr,
} from "../utils/datetime.js";

function mapGoogleToFC(googleEvent, meta) {
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
      providerId: meta?.providerId || "",
      providerName: meta?.providerName || "",
    },
  };
}

function CalendarPage() {
  const [providerId, setProviderId] = useState(
    () => localStorage.getItem("providerId") || "ALL"
  );
  const calRef = useRef(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState("");
  const [editProviderId, setEditProviderId] = useState("");
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

  async function fetchAllProvidersEvents(info) {
    const provs = await listProviders().catch(() => []);
    const usable = (provs || [])
      .filter((p) => p && p.active !== false && p.calendarId)
      .map((p) => ({
        id: String(p._id),
        name: p.displayName || p.username || "",
      }));

    const results = [];
    await Promise.all(
      usable.map(async (p) => {
        try {
          const data = await gcal.getEventsRange({
            timeMin: info.start.toISOString(),
            timeMax: info.end.toISOString(),
            providerId: p.id,
          });
          const items = Array.isArray(data.items) ? data.items : [];
          results.push(
            ...items.map((ev) =>
              mapGoogleToFC(ev, { providerId: p.id, providerName: p.name })
            )
          );
        } catch {
          /* skip this provider on failure */
        }
      })
    );
    return results;
  }

  async function fetchGoogleRange(info, successCallback, failureCallback) {
    try {
      if (!providerId) {
        successCallback([]);
        return;
      }
      if (providerId === "ALL") {
        const merged = await fetchAllProvidersEvents(info);
        successCallback(merged);
        return;
      }
      const data = await gcal.getEventsRange({
        timeMin: info.start.toISOString(),
        timeMax: info.end.toISOString(),
        providerId,
      });
      const items = Array.isArray(data.items) ? data.items : [];
      successCallback(
        items.map((ev) => mapGoogleToFC(ev, { providerId, providerName: "" }))
      );
    } catch (err) {
      failureCallback(err);
    }
  }

  async function onEventDropResize(changeInfo) {
    const ev = changeInfo.event;
    const start = ev.start ? new Date(ev.start) : null;
    const end = ev.end ? new Date(ev.end) : start;
    const pid =
      ev.extendedProps?.providerId || (providerId !== "ALL" ? providerId : "");

    try {
      if (!pid) throw new Error("Pick a provider first.");
      setBusy(true);
      await gcal.updateEvent(pid, ev.id, {
        start: { dateTime: toLocalRFC3339NoZ(start), timeZone: TZ },
        end: end
          ? { dateTime: toLocalRFC3339NoZ(end), timeZone: TZ }
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
    setEditProviderId(
      ev.extendedProps?.providerId || (providerId !== "ALL" ? providerId : "")
    );
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
    if (!editId) return;
    try {
      setBusy(true);
      const pid = editProviderId || (providerId !== "ALL" ? providerId : "");
      if (!pid) throw new Error("Pick a provider first.");

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

      await gcal.updateEvent(pid, editId, updates);

      setBusy(false);
      setPanelOpen(false);
      refetchCalendar();
    } catch (e) {
      setBusy(false);
      alert(e.message || "Failed to save");
    }
  }

  async function handleDelete() {
    if (!editId) return;
    const ok = confirm(`Delete "${form.summary || "(no title)"}"?`);
    if (!ok) return;
    try {
      setBusy(true);
      const pid = editProviderId || (providerId !== "ALL" ? providerId : "");
      if (!pid) throw new Error("Pick a provider first.");
      await gcal.deleteEvent(pid, editId);
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
  <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
    {/* Page title */}
    <h2 className="text-2xl font-semibold text-teal-600 text-center">Calendar</h2>

    {/* Provider picker card */}
    <div className="flex justify-center">
      <div className="bg-white border border-gray-200 rounded-lg shadow p-4 w-full max-w-3xl">
        <ProviderPicker value={providerId} onChange={setProviderId} allowAll />
      </div>
    </div>

    {/* Calendar card */}
    <div className="flex justify-center">
      <div className="bg-white border border-gray-200 rounded-lg shadow p-2 md:p-4 w-full max-w-5xl">
        <FullCalendar
          ref={calRef}
          className="fc-teal"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          editable
          selectable={false}
          eventOverlap
          events={fetchGoogleRange}
          eventDrop={onEventDropResize}
          eventResize={onEventDropResize}
          eventClick={onEventClick}
          height="auto"
        />
      </div>
    </div>

    {/* Edit panel */}
    {panelOpen && (
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6 space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <strong className="text-teal-700">Edit Appointment</strong>
          <button
            onClick={() => setPanelOpen(false)}
            disabled={busy}
            className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 transition disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Title</span>
            <input
              type="text"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Notes (optional)</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Location (optional)</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.changeTime}
              onChange={(e) => setForm((f) => ({ ...f, changeTime: e.target.checked }))}
              className="h-4 w-4 accent-teal-600"
            />
            <span className="text-sm text-gray-700">Change time?</span>
          </label>

          <div className={`flex flex-wrap gap-3 items-center ${form.changeTime ? "" : "opacity-60"}`}>
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                disabled={!form.changeTime}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Start</span>
              <input
                type="time"
                value={form.start}
                onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                disabled={!form.changeTime}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-600">End</span>
              <input
                type="time"
                value={form.end}
                onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                disabled={!form.changeTime}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50"
              />
            </label>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={handleSave}
              disabled={busy}
              className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-60"
            >
              Save
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 transition disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default CalendarPage;
