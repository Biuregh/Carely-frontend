import { useState } from 'react';

function Agenda() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [day, setDay] = useState(today);
  const [events, setEvents] = useState([]);

  const load = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/gcal/agenda?day=${day}`, {
      credentials: 'include'
    });
    const data = await res.json();
    setEvents(data.events || []);
  };

  return (
    <div style={{ padding: 16, border: '1px solid #eee', marginTop: 12 }}>
      <h3>Agenda</h3>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        <button onClick={load}>Load</button>
      </div>

      <ul style={{ marginTop: 12 }}>
        {events.map((ev) => (
          <li key={ev.id}>
            <strong>{ev.summary || '(no title)'}</strong> — {ev.start?.dateTime || ev.start?.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Agenda;

