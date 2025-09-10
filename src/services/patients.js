import { api } from "./api.js";
import { jsonFetch } from "./http.js";

const checkIn = (payload) =>
  api("/patients/checkin", { method: "POST", body: payload });

const getPatient = (id) => api(`/patients/${id}`);
const updatePatient = (id, update) =>
  api(`/patients/${id}`, { method: "PUT", body: update });

const createPatient = (payload) =>
  jsonFetch("/patients", { method: "POST", body: payload });

const getPatientAppointments = (id) => api(`/patients/${id}/appointments`);
const schedulePatientAppointment = (id, payload) =>
  api(`/patients/${id}/appointments`, { method: "POST", body: payload });

const searchPatients = (params = {}) => {
  const usp = new URLSearchParams(params);
  return api(`/patients?${usp.toString()}`);
};

const deactivatePatient = (id) =>
  api(`/patients/${id}/active`, { method: "PATCH", body: { active: false } });

const reactivatePatient = (id) =>
  api(`/patients/${id}/active`, { method: "PATCH", body: { active: true } });

const hardDeletePatient = (id) => api(`/patients/${id}`, { method: "DELETE" });

export {
  checkIn,
  getPatient,
  updatePatient,
  createPatient,
  getPatientAppointments,
  schedulePatientAppointment,
  searchPatients,
  deactivatePatient,
  reactivatePatient,
  hardDeletePatient,
};
