// components/Agenda/Agenda.jsx
import { useEffect, useMemo, useState } from "react";
import * as gcal from "../../services/gcalService";

const TZ = "America/New_York";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function toLocalDisplay(dtOrDate) {
  if (!dtOrDate) return "";
  const d = new Date(dtOrDate);
  if (Number.isNaN(d.getTime())) return dtOrDate;
  return d.toLocaleString();
}

// "YYYY-MM-DD","HH:MM" (24h) -> "YYYY-MM-DDTHH:MM:00" (NO 'Z')
function toLocalRFC3339NoZ(dateStr, time24) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time24.split(":").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
}

const Agenda = ({ providerId = "" }) => {
  const [day, setDay] = useState(todayStr());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // inline edit
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    summary: "",
    description: "",
    location: "",
    date: todayStr(),
    start: "09:00",
    end: "09:30",
    changeTime: false, // only send start/end when true
  });

  const rangeLabel = useMemo(() => {
    const start = new Date(day + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return `${start.toLocaleDateString()} → ${end.toLocaleDateString()}`;
  }, [day]);

  async function load() {
    try {
      if (!providerId) {
        setErr("Pick a provider first.");
        return;
      }
      setErr("");
      setLoading(true);
      const data = await gcal.getAgenda({ day, providerId });
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setErr(e.message || "Failed to load agenda");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // keep manual Load UX
  }, []);

  function beginEdit(ev) {
    const id = ev.id;
    const startIso = ev.start?.dateTime || ev.start?.date || "";
    const endIso = ev.end?.dateTime || ev.end?.date || "";
    const start = new Date(startIso);
    const end = new Date(endIso);
    const pad = (n) => String(n).padStart(2, "0");

    setEditingId(id);
    setEditForm({
      summary: ev.summary || "",
      description: ev.description || "",
      location: ev.location || "",
      date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
        start.getDate()
      )}`,
      start: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      end: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      changeTime: false,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    try {
      setErr("");
      setLoading(true);

      // build partial update body
      const updates = {
        summary: editForm.summary,
        description: editForm.description,
        location: editForm.location,
      };

      if (editForm.changeTime) {
        const startLocal = toLocalRFC3339NoZ(editForm.date, editForm.start);
        const endLocal = toLocalRFC3339NoZ(editForm.date, editForm.end);
        updates.start = { dateTime: startLocal, timeZone: TZ };
        updates.end = { dateTime: endLocal, timeZone: TZ };
      }

      // provider-scoped PATCH
      await gcal.updateEvent(providerId || undefined, id, updates);
      setEditingId(null);
      await load();
    } catch (e) {
      setErr(e.message || "Failed to update event");
      setLoading(false);
    }
  }

  async function remove(ev) {
    if (!providerId) {
      alert("Pick a provider first.");
      return;
    }
    if (!confirm(`Delete "${ev.summary || "(no title)"}"?`)) return;

    try {
      setErr("");
      setLoading(true);
      // provider-scoped DELETE (fix)
      await gcal.deleteEvent(providerId, ev.id);
      await load(); // refresh list
    } catch (e) {
      setErr(e.message || "Failed to delete event");
      setLoading(false);
    }
  }

  return (
    <div
      style={{ maxWidth: 760, margin: "16px auto", display: "grid", gap: 12 }}
    >
      <h2>Agenda</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label>
          Day:&nbsp;
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <button onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Load"}
        </button>
        <span style={{ fontSize: 12, opacity: 0.7 }}>Range: {rangeLabel}</span>
      </div>

      {err && <div style={{ color: "crimson" }}>Error: {err}</div>}
      {!loading && !err && items.length === 0 && (
        <div>No events for selected day.</div>
      )}

      {items.map((ev) => {
        const isEditing = editingId === ev.id;

        if (isEditing) {
          return (
            <div
              key={ev.id}
              style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <label>
                  Title
                  <input
                    type="text"
                    value={editForm.summary}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, summary: e.target.value }))
                    }
                  />
                </label>

                <label>
                  Notes (optional)
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Location (optional)
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                </label>

                <label
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editForm.changeTime}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        changeTime: e.target.checked,
                      }))
                    }
                  />
                  Change time?
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    opacity: editForm.changeTime ? 1 : 0.6,
                  }}
                >
                  <label>
                    Date
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, date: e.target.value }))
                      }
                      disabled={!editForm.changeTime}
                    />
                  </label>
                  <label>
                    Start
                    <input
                      type="time"
                      value={editForm.start}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, start: e.target.value }))
                      }
                      disabled={!editForm.changeTime}
                    />
                  </label>
                  <label>
                    End
                    <input
                      type="time"
                      value={editForm.end}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, end: e.target.value }))
                      }
                      disabled={!editForm.changeTime}
                    />
                  </label>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => saveEdit(ev.id)} disabled={loading}>
                    Save
                  </button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        }

        const start = ev.start?.dateTime || ev.start?.date || "";
        const end = ev.end?.dateTime || ev.end?.date || "";

        return (
          <div
            key={ev.id}
            style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {ev.summary || "(no title)"}
            </div>
            <div style={{ marginBottom: 6 }}>
              {toLocalDisplay(start)} — {toLocalDisplay(end)}
            </div>
            {ev.location && <div>📍 {ev.location}</div>}
            {ev.description && (
              <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                {ev.description}
              </div>
            )}
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => beginEdit(ev)}>Edit</button>
              <button onClick={() => remove(ev)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Agenda;
