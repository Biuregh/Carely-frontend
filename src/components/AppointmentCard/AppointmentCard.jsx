import { useState } from "react";
import { minutesDiff, fmtDate, fmtTime } from "../../utils/datetime.js";

function AppointmentCard({ appt, onReschedule, onCancel }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    date: appt.startISO.slice(0, 10),
    start: new Date(appt.startISO).toTimeString().slice(0, 5),
    end: new Date(appt.endISO).toTimeString().slice(0, 5),
  });

  const durMin = minutesDiff(appt.startISO, appt.endISO);

  return (
    <article>
      <header>
        <h4>
          {appt.patient?.name} — {appt.status}
        </h4>
        <div>ID: {appt.code}</div>
      </header>

      <div>
        <div>
          {fmtDate(appt.startISO)} · {fmtTime(appt.startISO)} ({durMin} min)
        </div>
        <div>
          {appt.provider?.name} · {appt.reason || ""}
        </div>
      </div>

      {!editing && (
        <div>
          <button onClick={() => setEditing(true)}>Reschedule</button>
          <button onClick={() => onCancel?.(appt)}>Cancel</button>
        </div>
      )}

      {editing && (
        <div>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
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
            />
          </label>
          <label>
            End
            <input
              type="time"
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
            />
          </label>
          <div>
            <button
              onClick={async () => {
                await onReschedule?.(appt, form);
                setEditing(false);
              }}
            >
              Save
            </button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
      <hr />
    </article>
  );
}

export default AppointmentCard;
