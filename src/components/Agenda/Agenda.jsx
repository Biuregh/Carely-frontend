import { useState, useContext } from "react";
import { getAgenda } from "../../services/gcalService";
import { UserContext } from "../../contexts/UserContext";

function Agenda({ providerId }) {
  const today = new Date().toISOString().slice(0, 10);
  const [day, setDay] = useState(today);
  const [events, setEvents] = useState([]);
  const { user } = useContext(UserContext);

  const load = async () => {
    const effectiveProviderId =
      user?.role === "provider" ? user._id : providerId;
    const data = await getAgenda({ day, providerId: effectiveProviderId });
    setEvents(data.events || []);
  };

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
      <ul style={{ marginTop: 12 }}>
        {events.map((ev) => (
          <li key={ev.id}>
            <strong>{ev.summary || "(no title)"}</strong> —{" "}
            {ev.start?.dateTime || ev.start?.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Agenda;
