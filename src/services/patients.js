import { api } from "./api.js";

// Public check-in
const checkIn = (payload) =>
  api("/patients/checkin", { method: "POST", body: payload });

// Patient profile
const getPatient = (id) => api(`/patients/${id}`);
const updatePatient = (id, update) =>
  api(`/patients/${id}`, { method: "PUT", body: update });

// Appointments for a patient
const getPatientAppointments = (id) => api(`/patients/${id}/appointments`);
const schedulePatientAppointment = (id, payload) =>
  api(`/patients/${id}/appointments`, { method: "POST", body: payload });

// Patient search (optionally include next few appts)
const searchPatients = (params = {}) => {
  const usp = new URLSearchParams(params);
  return api(`/patients?${usp.toString()}`);
};

export {
  checkIn,
  getPatient,
  updatePatient,
  getPatientAppointments,
  schedulePatientAppointment,
  searchPatients,
};
