import { useState } from "react"
import PatientSearch from "../components/PatientSearch/PatientSearch"
import AppointmentForm from "../components/AppointmentForm/AppointmentForm"

const AppoinmentSchedule = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-3xl bg-white shadow rounded p-20"></div>
              <h2 className="text-2xl font-semibold text-teal-600 mb-4">Receptionist Appointment Scheduling</h2>
            <div className="twoCol">
                <PatientSearch onSelectPatient={setSelectedPatient} />
                <AppointmentForm patient={selectedPatient} />
            </div>
        </div>
    );

}

export default AppoinmentSchedule;