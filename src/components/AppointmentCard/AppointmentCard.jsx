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
  <article className="bg-white border rounded p-4 md:p-5">

    <header className="mb-4 grid gap-1 md:grid-cols-[1fr_auto] md:items-center">
      <h4 className="text-base md:text-lg font-semibold text-gray-800">
        {appt.patient?.name}{" "}
        <span
          className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
            ${
              appt.status === "cancelled"
                ? "bg-red-50 text-red-700 ring-red-200"
                : appt.status === "rescheduled"
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : "bg-emerald-50 text-emerald-700 ring-emerald-200"
            }`}
        >
          {appt.status}
        </span>
      </h4>
      <div className="text-xs text-gray-500 md:text-right">ID: {appt.code}</div>
    </header>

    
    <div className="mb-4 grid gap-1 text-sm text-gray-700">
      <div>
        {fmtDate(appt.startISO)} · {fmtTime(appt.startISO)} ({durMin} min)
      </div>
      <div>
        {appt.provider?.name} · {appt.reason || ""}
      </div>
    </div>

    
    {!editing && (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-3 py-2 rounded border border-teal-600 text-teal-700 bg-white
                     hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500
                     transition-colors"
        >
          Reschedule
        </button>
        <button
          type="button"
          onClick={() => onCancel?.(appt)}
          className="px-3 py-2 rounded border border-red-600 text-red-700 bg-white
                     hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500
                     transition-colors"
        >
          Cancel
        </button>
      </div>
    )}

    
    {editing && (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((f) => ({ ...f, date: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start
            </label>
            <input
              type="time"
              value={form.start}
              onChange={(e) =>
                setForm((f) => ({ ...f, start: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End
            </label>
            <input
              type="time"
              value={form.end}
              onChange={(e) =>
                setForm((f) => ({ ...f, end: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              await onReschedule?.(appt, form);
              setEditing(false);
            }}
            className="px-4 py-2 rounded bg-teal-600 text-white
                       hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500
                       transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded bg-gray-100 text-gray-800
                       hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500
                       transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    <hr className="mt-4 border-gray-200" />
  </article>
);
}

export default AppointmentCard;
