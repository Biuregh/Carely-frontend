import { useState, useContext, useMemo } from "react";
import { createEvent } from "../../services/gcalService";
import { UserContext } from "../../contexts/UserContext";

/* ---------- time helpers ---------- */

// Accepts:
//  - "2", "2:5", "2:05", "02:05", "2pm", "2:05PM", "14:00", "23:59"
// Returns normalized 12h display ("hh:mm") and AM/PM
function normalizeTo12h(raw, fallbackAmPm = "AM") {
  if (!raw) return { display: "", ampm: fallbackAmPm };

  const s = String(raw).trim().toLowerCase().replace(/\s+/g, "");

  // Explicit am/pm
  const withAmPm = s.match(/^(\d{1,2})(?::?(\d{1,2}))?(am|pm)$/i);
  if (withAmPm) {
    let h = parseInt(withAmPm[1], 10);
    let m = parseInt(withAmPm[2] ?? "0", 10);
    const ampm = withAmPm[3].toUpperCase();
    if (h < 1 || h > 12) return { display: "", ampm: fallbackAmPm };
    if (m < 0 || m > 59) return { display: "", ampm: fallbackAmPm };
    return {
      display: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      ampm,
    };
  }

  // 24h "HH:MM"
  const m24 = s.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (m24) {
    const h24 = parseInt(m24[1], 10);
    const m = parseInt(m24[2], 10);
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      display: `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      ampm,
    };
  }

  // Loose "H" or "H:MM" (assume fallback AM/PM)
  const loose = s.match(/^(\d{1,2})(?::?(\d{1,2}))?$/);
  if (loose) {
    let h = parseInt(loose[1], 10);
    let m = parseInt(loose[2] ?? "0", 10);
    if (h < 1 || h > 12 || m < 0 || m > 59)
      return { display: "", ampm: fallbackAmPm };
    return {
      display: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      ampm: fallbackAmPm,
    };
  }

  return { display: "", ampm: fallbackAmPm };
}

function to24h(hour12, ampm) {
  let h = hour12 % 12;
  if (ampm === "PM") h += 12;
  return h;
}

function localDateFrom(dateStr, timeDisplayHHmm, ampm) {
  if (!dateStr || !timeDisplayHHmm) return null;
  const y = Number(dateStr.slice(0, 4));
  const mo = Number(dateStr.slice(5, 7)) - 1;
  const d = Number(dateStr.slice(8, 10));
  const [hh, mm] = timeDisplayHHmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const hh24 = to24h(hh, ampm);
  return new Date(y, mo, d, hh24, mm, 0, 0); // local time
}

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

/* ---------- component ---------- */

function CreateEvent({ providerId }) {
  const { user } = useContext(UserContext);

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [summary, setSummary] = useState("New Patient — Checkup");
  const [description, setDescription] = useState("Reason: annual physical");

  // Start fields (no pre-fill times; placeholders only)
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState(""); // free typing
  const [startAmPm, setStartAmPm] = useState("AM");

  // End fields (no pre-fill times)
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState(""); // free typing
  const [endAmPm, setEndAmPm] = useState("AM");

  const [attendees, setAttendees] = useState("");
  const [clientErr, setClientErr] = useState("");
  const [result, setResult] = useState(null);

  // Let the user type anything; normalize ONLY on blur.
  const onStartTimeBlur = () => {
    const { display, ampm } = normalizeTo12h(startTime, startAmPm);
    if (display) {
      setStartTime(display);
      setStartAmPm(ampm);
    }
  };
  const onEndTimeBlur = () => {
    const { display, ampm } = normalizeTo12h(endTime, endAmPm);
    if (display) {
      setEndTime(display);
      setEndAmPm(ampm);
    }
  };

  // Build preview ISO (or error)
  let startISO = "";
  let endISO = "";
  let parseError = "";

  const startDT = startTime
    ? localDateFrom(startDate, startTime, startAmPm)
    : null;
  const endDT = endTime ? localDateFrom(endDate, endTime, endAmPm) : null;

  if (startDT && endDT) {
    if (endDT <= startDT) {
      parseError = "End must be after start (consider different date or time).";
    } else {
      startISO = toRFC3339Local(startDT);
      endISO = toRFC3339Local(endDT);
    }
  }

  const submit = async (e) => {
    e.preventDefault();
    setClientErr("");
    setResult(null);

    const effectiveProviderId =
      user?.role === "provider" ? user._id : providerId;
    if (!effectiveProviderId) {
      setClientErr("Select a provider first.");
      return;
    }
    if (!startDate || !startTime || !endDate || !endTime) {
      setClientErr("Start and End date/time are required.");
      return;
    }
    // Final normalize on submit (in case user didn't blur)
    const nStart = normalizeTo12h(startTime, startAmPm);
    const nEnd = normalizeTo12h(endTime, endAmPm);
    if (!nStart.display || !nEnd.display) {
      setClientErr("Enter valid times (e.g., 9:30, 2pm, or 14:00).");
      return;
    }
    const sDT = localDateFrom(startDate, nStart.display, nStart.ampm);
    const eDT = localDateFrom(endDate, nEnd.display, nEnd.ampm);
    if (!sDT || !eDT || eDT <= sDT) {
      setClientErr("End must be after start (check date/time).");
      return;
    }

    const payload = {
      providerId: effectiveProviderId,
      summary: summary.trim(),
      description: description.trim(),
      startISO: toRFC3339Local(sDT),
      endISO: toRFC3339Local(eDT),
      attendeeEmails: attendees
        ? attendees
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const data = await createEvent(payload);
      setResult(data);
      if (data.ok) alert(`Event created!\n${data.htmlLink}`);
    } catch (err) {
      setResult({ ok: false, err: err.message });
    }
  };

  // tiny helper for a11y-only labels
  const srOnly = {
    position: "absolute",
    left: "-10000px",
    top: "auto",
    width: "1px",
    height: "1px",
    overflow: "hidden",
  };

  return (
    <div style={{ padding: 16, border: "1px solid #eee", marginTop: 12 }}>
      <h3>Create Google Event</h3>

      <form
        onSubmit={submit}
        style={{ display: "grid", gap: 8, maxWidth: 620 }}
      >
        <label>
          Title{" "}
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Appointment title"
            required
          />
        </label>

        <label>
          Description{" "}
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes / reason"
          />
        </label>

        {/* START: DATE + TIME + AM/PM (no visible label for AM/PM) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 100px",
            gap: 8,
          }}
        >
          <label>
            Start Date{" "}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
          <label>
            Start Time{" "}
            <input
              placeholder="e.g. 9:30 or 14:00"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)} // no validation while typing
              onBlur={onStartTimeBlur} // normalize on blur
              required
            />
          </label>
          <div>
            <span style={srOnly}>Start AM/PM</span>
            <select
              aria-label="Start AM/PM"
              value={startAmPm}
              onChange={(e) => setStartAmPm(e.target.value)}
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        {/* END: DATE + TIME + AM/PM (no visible label for AM/PM) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 100px",
            gap: 8,
          }}
        >
          <label>
            End Date{" "}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
          <label>
            End Time{" "}
            <input
              placeholder="e.g. 10:15 or 15:15"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)} // no validation while typing
              onBlur={onEndTimeBlur} // normalize on blur
              required
            />
          </label>
          <div>
            <span style={srOnly}>End AM/PM</span>
            <select
              aria-label="End AM/PM"
              value={endAmPm}
              onChange={(e) => setEndAmPm(e.target.value)}
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div style={{ fontSize: 12, color: parseError ? "#b00020" : "#555" }}>
          {parseError ? (
            <div>{parseError}</div>
          ) : (
            <>
              <div>
                <strong>startISO:</strong> {startISO || "(fill start)"}
              </div>
              <div>
                <strong>endISO:</strong> {endISO || "(fill end)"}
              </div>
            </>
          )}
        </div>

        <label>
          Attendees (comma-separated){" "}
          <input
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="a@b.com, b@c.com"
          />
        </label>

        <button
          type="submit"
          disabled={user?.role !== "provider" && !providerId}
        >
          Create
        </button>
      </form>

      {clientErr && (
        <div style={{ marginTop: 8, color: "#b00020" }}>{clientErr}</div>
      )}

      {result && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default CreateEvent;
