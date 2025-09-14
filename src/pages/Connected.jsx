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
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-4xl bg-white shadow rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-teal-600 mb-4 text-center">
        Schedule Appointments
      </h2>
      <p className="text-gray-600 text-sm mb-6 text-center">
        Pick a provider, create a new appointment, and review today’s agenda.
      </p>

      <div className="space-y-6">
        
        <div className="bg-white border rounded p-4">
          <ProviderPicker value={providerId} onChange={setProviderId} />
        </div>

        <div className="bg-white border rounded p-4">
          <CreateEvent providerId={providerId} />
        </div>

        <div className="bg-white border rounded p-4">
          <Agenda providerId={providerId} />
        </div>
      </div>
    </div>
  </div>
);
}
export default Connected;
