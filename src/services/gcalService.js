const API = import.meta.env.VITE_API_BASE;

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function createEvent(payload) {
  const res = await fetch(`${API}/api/gcal/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.err || res.statusText);
  return data;
}

async function getAgenda({ day, providerId }) {
  const url = new URL(`${API}/api/gcal/agenda`);
  url.searchParams.set("day", day);
  if (providerId) url.searchParams.set("providerId", providerId);
  const res = await fetch(url, {
    headers: authHeader(),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.err || res.statusText);
  return data;
}

async function getEventsRange({ timeMin, timeMax, providerId }) {
  const url = new URL(`${API}/api/gcal/events-range`);
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  if (providerId) url.searchParams.set("providerId", providerId);
  const res = await fetch(url, {
    headers: authHeader(),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.err || res.statusText);
  return data;
}

async function deleteEvent(providerId, eventId) {
  const url = new URL(`${API}/api/gcal/events/${eventId}`);
  if (providerId) url.searchParams.set("providerId", providerId);
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeader(),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.err || res.statusText);
  return data;
}

async function updateEvent(providerId, eventId, updates) {
  const url = new URL(`${API}/api/gcal/events/${eventId}`);
  if (providerId) url.searchParams.set("providerId", providerId);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.err || res.statusText);
  return data;
}

export { createEvent, getAgenda, getEventsRange, deleteEvent, updateEvent };
