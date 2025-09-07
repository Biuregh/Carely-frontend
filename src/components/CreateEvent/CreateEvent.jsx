import { useState } from "react";
import * as gcal from "../../services/gcalService";

const TZ = "America/New_York";
const pad = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DD", "HH:MM" (24h) -> "YYYY-MM-DDTHH:MM:00"
function toLocalRFC3339NoZ(dateStr, time24) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time24.split(":").map(Number);
  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
}

// normalize if some input ever sends "2:00 PM"
function to24h(s) {
  const t = String(s).trim().toUpperCase();
  const ampm = /AM|PM/.test(t) ? t.slice(-2) : null;
  const core = t.replace(/\s?(AM|PM)$/i, "");
  const [hStr, mStr = "0"] = core.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return s;
  if (ampm === "AM") h = h === 12 ? 0 : h;
  if (ampm === "PM") h = h === 12 ? 12 : h + 12;
  return `${pad(h)}:${pad(m)}`;
}

const CreateEvent = ({ providerId = "" }) => {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [calendarId, setCalendarId] = useState("primary");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!summary || !date || !start || !end) {
      alert("Summary, date, start, and end are required.");
      return;
    }

    const start24 = /^\d{1,2}:\d{2}$/.test(start) ? start : to24h(start);
    const end24 = /^\d{1,2}:\d{2}$/.test(end) ? end : to24h(end);
    const startLocal = toLocalRFC3339NoZ(date, start24);
    const endLocal = toLocalRFC3339NoZ(date, end24);

    const payload = {
      calendarId,
      providerId: providerId || undefined, // pass through if present
      summary,
      description,
      location,
      start: { dateTime: startLocal, timeZone: TZ },
      end: { dateTime: endLocal, timeZone: TZ },
    };

    try {
      await gcal.createEvent(payload);
      alert("Event created.");
    } catch (err) {
      alert("Failed to create event: " + (err.message || String(err)));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 480 }}
    >
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <label>
        Calendar ID
        <input
          type="text"
          value={calendarId}
          onChange={(e) => setCalendarId(e.target.value)}
          placeholder='e.g. "primary" or "abc123@group.calendar.google.com"'
          required
        />
      </label>
      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <label>
        Start
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
      </label>
      <label>
        End
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
      </label>
      <button type="submit">Create Event</button>
    </form>
  );
};

export default CreateEvent;
