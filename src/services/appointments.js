import { api } from "./api";

const searchPatient = async ({ name, dob, email, phone }) => {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (dob) params.append("dob", dob);
    if (email) params.append("email", email);
    if (phone) params.append("phone", phone);
    return await api(`/patient?${params.toString()}`);
}

const providersList = async () => {
    return await api("/providers")
}

const availableSlots = async ({ providerId, date }) => {
    const params = new URLSearchParams({ providerId, date });
    return await api(`/availability?${params.toString()}`)
}

const createAppointment = async ({patiendId, providerId, date, time, type}) =>{
    return await api("/appointments",{
        method: "POST",
        body:{ patiendId, providerId, date, time, type}
    })
};

export{searchPatient, providersList, availableSlots, createAppointment}