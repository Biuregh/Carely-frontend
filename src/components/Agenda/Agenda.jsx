import { useState, useContext } from "react";
import {
  getAgenda,
  deleteEvent,
  updateEvent,
} from "../../services/gcalService";
import { UserContext } from "../../contexts/UserContext";

/** Format Date to RFC3339 with local offset (YYYY-MM-DDTHH:MM:00+HH:MM) */
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

/** Convert Google event (agenda shape) to local editable state */
function toEditable(ev) {
  const startISO = ev.start?.dateTime || ev.start?.date;
  const endISO = ev.end?.dateTime || ev.end?.date || startISO;
  return {
    id: ev.id,
    summary: ev.summary || "",
    description: ev.description || "",
    // agenda endpoint returns attendees as [{email, ...}]
    attendees: Array.isArray(ev.attendees)
      ? ev.attendees.map((a) => ({ email: a.email }))
      : [],
    // keep both ISO (string) and Date for UI convenience
    startISO,
    endISO,
    htmlLink: ev.htmlLink || "",
  };
}

function Agenda({ providerId }) {
  const today = new Date().toISOString().slice(0, 10);
  const { user } = useContext(UserContext);

  const [day, setDay] = useState(today);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(null); // {id, summary, description, attendees[], startISO, endISO}

  const effectiveProviderId = user?.role === "provider" ? user._id : providerId;

  const load = async () => {
    setMsg("");
    try {
      const data = await getAgenda({ day, providerId: effectiveProviderId });
      setEvents(data.events || []);
      // if editing an event that vanished, close editor
      if (editing && !(data.events || []).some((e) => e.id === editing.id)) {
        setEditing(null);
      }
    } catch (e) {
      setEvents([]);
      setMsg(e.message || "Failed to load agenda.");
    }
  };

  const onDelete = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    setMsg("");
    try {
      await deleteEvent(effectiveProviderId, eventId);
      setMsg("Event deleted.");
      setEditing(null);
      await load();
    } catch (e) {
      setMsg(e.message || "Failed to delete.");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setMsg("");
    try {
      const payload = {
        summary: (editing.summary || "").trim(),
        description: (editing.description || "").trim(),
        startISO: editing.startISO,
        endISO: editing.endISO,
        attendeeEmails: (editing.attendees || []).map((a) => a.email),
      };
      await updateEvent(effectiveProviderId, editing.id, payload);
      setMsg("Event updated.");
      setEditing(null);
      await load();
    } catch (e) {
      setMsg(e.message || "Failed to update.");
    }
  };

  // small helpers to shift date strings by minutes
  function shiftISO(iso, minutes) {
    if (!iso) return iso;
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + minutes);
    return toRFC3339Local(d);
  }

  return (
    <div style={{ padding: 16, border: "1px solid #eee", marginTop: 12 }}>
      <h3>Agenda</h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
        <button
          onClick={load}
          disabled={user?.role !== "provider" && !providerId}
        >
          Load
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 8, color: "#555", whiteSpace: "pre-wrap" }}>
          {msg}
        </div>
      )}

      <ul style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {events.map((ev) => {
          const isEditing = editing?.id === ev.id;
          if (!isEditing) {
            return (
              <li key={ev.id} style={{ border: "1px solid #eee", padding: 8 }}>
                <div>
                  <strong>{ev.summary || "(no title)"}</strong> —{" "}
                  {ev.start?.dateTime || ev.start?.date}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditing(toEditable(ev))}>
                    Edit
                  </button>
                  <button onClick={() => onDelete(ev.id)}>Delete</button>
                  {ev.htmlLink && (
                    <a
                      href={ev.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: "auto" }}
                    >
                      Open in Google
                    </a>
                  )}
                </div>
              </li>
            );
          }

          // EDIT MODE
          return (
            <li key={ev.id} style={{ border: "1px solid #eee", padding: 8 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label>
                  Title{" "}
                  <input
                    value={editing.summary}
                    onChange={(e) =>
                      setEditing({ ...editing, summary: e.target.value })
                    }
                  />
                </label>
                <label>
                  Description{" "}
                  <input
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                  />
                </label>
                <label>
                  Attendees (comma-separated){" "}
                  <input
                    value={(editing.attendees || [])
                      .map((a) => a.email)
                      .join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        attendees: e.target.value
                          .split(",")
                          .map((s) => ({ email: s.trim() }))
                          .filter((a) => a.email),
                      })
                    }
                  />
                </label>

                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    <strong>Start:</strong> {editing.startISO || "(none)"}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    <strong>End:</strong> {editing.endISO || "(none)"}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() =>
                        setEditing({
                          ...editing,
                          startISO: shiftISO(editing.startISO, -30),
                        })
                      }
                    >
                      Start -30m
                    </button>
                    <button
                      onClick={() =>
                        setEditing({
                          ...editing,
                          startISO: shiftISO(editing.startISO, 30),
                        })
                      }
                    >
                      Start +30m
                    </button>
                    <button
                      onClick={() =>
                        setEditing({
                          ...editing,
                          endISO: shiftISO(editing.endISO, -30),
                        })
                      }
                    >
                      End -30m
                    </button>
                    <button
                      onClick={() =>
                        setEditing({
                          ...editing,
                          endISO: shiftISO(editing.endISO, 30),
                        })
                      }
                    >
                      End +30m
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditing(null)}>Cancel</button>
                  <button
                    onClick={() => onDelete(editing.id)}
                    style={{ marginLeft: "auto" }}
                  >
                    Delete
                  </button>
                  {editing.htmlLink && (
                    <a
                      href={editing.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ alignSelf: "center" }}
                    >
                      Open in Google
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Agenda;
