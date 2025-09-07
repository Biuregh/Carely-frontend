import { useState, useEffect } from "react";
import ProviderPicker from "../components/ProviderPicker/ProviderPicker.jsx";
import CreateEvent from "../components/CreateEvent/CreateEvent.jsx";
import Agenda from "../components/Agenda/Agenda.jsx";

function Connected() {
  const [providerId, setProviderId] = useState(
    () => localStorage.getItem("providerId") || ""
  );

  useEffect(() => {
    if (providerId) localStorage.setItem("providerId", providerId);
    else localStorage.removeItem("providerId"); // clear if blank
  }, [providerId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Google Calendar connected</h2>
      <ProviderPicker value={providerId} onChange={setProviderId} />
      <CreateEvent providerId={providerId} />
      <Agenda providerId={providerId} />
    </div>
  );
}
export default Connected;
