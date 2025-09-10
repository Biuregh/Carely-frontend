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
    else localStorage.removeItem("providerId");
  }, [providerId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow rounded p-20">
          <h2 className="text-2xl font-semibold text-teal-600 mb-4">Schedule Appointments</h2>
          <ProviderPicker value={providerId} onChange={setProviderId} />
          <CreateEvent providerId={providerId} />
          <Agenda providerId={providerId} />
      </div>
    </div>
  );
}
export default Connected;
