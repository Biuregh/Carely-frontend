
import { api } from './api.js';

// POST /patients/checkin
const checkIn = async (payload) => {
  console.log('checkIn payload:', payload);
  return api('/patients/checkin', { method: 'POST', body: payload });
};

// GET /patients/:id
const getPatient = async (id) => {
  console.log('getPatient id:', id);
  return api(`/patients/${id}`);
};

// PUT /patients/:id
const updatePatient = async (id, update) => {
  console.log('updatePatient id:', id, 'update:', update);
  return api(`/patients/${id}`, { method: 'PUT', body: update });
};

export { checkIn, getPatient, updatePatient };
