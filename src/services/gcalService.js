import { jsonFetch } from "./http.js";

function q(path, params) {
  const usp = new URLSearchParams(params);
  return `${path}?${usp.toString()}`;
}

async function createEvent(payload) {
  return jsonFetch("/api/gcal/events", { method: "POST", body: payload });
}

async function getAgenda({ day, providerId }) {
  return jsonFetch(
    q("/api/gcal/agenda", { day, ...(providerId ? { providerId } : {}) })
  );
}

async function getEventsRange({ timeMin, timeMax, providerId }) {
  return jsonFetch(
    q("/api/gcal/events-range", {
      timeMin,
      timeMax,
      ...(providerId ? { providerId } : {}),
    })
  );
}

async function deleteEvent(providerId, eventId) {
  return jsonFetch(
    q(`/api/gcal/events/${encodeURIComponent(eventId)}`, {
      ...(providerId ? { providerId } : {}),
    }),
    { method: "DELETE" }
  );
}

async function updateEvent(providerId, eventId, updates) {
  return jsonFetch(
    q(`/api/gcal/events/${encodeURIComponent(eventId)}`, {
      ...(providerId ? { providerId } : {}),
    }),
    { method: "PATCH", body: updates }
  );
}

export { createEvent, getAgenda, getEventsRange, deleteEvent, updateEvent };
