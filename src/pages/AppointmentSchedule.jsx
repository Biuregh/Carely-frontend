import { useState } from "react"
import PatientSearch from "../components/PatientSearch/PatientSearch"
import AppointmentForm from "../components/AppointmentForm/AppointmentForm"

const AppoinmentSchedule = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);

    return (
        <div className="page">
            <h2 className="pageTitle">Receptionist Appointment Scheduling</h2>
            <div className="twoCol">
                <PatientSearch onSelectPatient={setSelectedPatient} />
                <AppointmentForm patient={selectedPatient} />
            </div>
        </div>
    );

}

export default AppoinmentSchedule;