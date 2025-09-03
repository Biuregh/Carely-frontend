import { useState } from 'react';

function CreateEvent() {
  const [form, setForm] = useState({
    summary: 'New Patient — Checkup',
    description: 'Reason: annual physical',
    startISO: '2025-09-02T14:00:00-04:00',
    endISO:   '2025-09-02T14:30:00-04:00',
    attendeeEmails: 'doctor@clinic.com'
  });
  const [result, setResult] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/gcal/events`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        attendeeEmails: form.attendeeEmails
          ? form.attendeeEmails.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      })
    });
    const data = await res.json();
    setResult(data);
    if (data.ok) alert(`Event created!\n${data.htmlLink}`);
  };

  return (
    <div style={{ padding: 16, border: '1px solid #eee', marginTop: 12 }}>
      <h3>Create Google Event</h3>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <label>
          Title
          <input name="summary" value={form.summary} onChange={onChange} />
        </label>

        <label>
          Description
          <input name="description" value={form.description} onChange={onChange} />
        </label>

        <label>
          Start (RFC3339)
          <input name="startISO" value={form.startISO} onChange={onChange} />
        </label>

        <label>
          End (RFC3339)
          <input name="endISO" value={form.endISO} onChange={onChange} />
        </label>

        <label>
          Attendees (comma-separated)
          <input
            name="attendeeEmails"
            value={form.attendeeEmails}
            onChange={onChange}
            placeholder="a@b.com,b@c.com"
          />
        </label>

        <button type="submit">Create</button>
      </form>

      {result && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default CreateEvent;
