import { jsonFetch } from "./http.js";

/**
 * List appointments from the backend with optional filters.
 */
async function list({
  by,
  term,
  providerId,
  timeMin,
  timeMax,
  limit = 500,
} = {}) {
  const params = new URLSearchParams();
  if (by) params.set("by", by);
  if (term) params.set("term", term);
  if (providerId) params.set("providerId", providerId);
  if (timeMin) params.set("timeMin", timeMin);
  if (timeMax) params.set("timeMax", timeMax);
  if (limit) params.set("limit", String(limit));
  const res = await jsonFetch(`/api/appointments?${params.toString()}`);
  return Array.isArray(res?.items) ? res.items : [];
}

async function create({
  providerId,
  patientId,
  date,
  start,
  end,
  reason,
  code,
}) {
  return jsonFetch(`/api/appointments`, {
    method: "POST",
    body: { providerId, patientId, date, start, end, reason, code },
  });
}

async function reschedule(id, { date, start, end, startISO, endISO }) {
  const body = {};
  if (startISO && endISO) {
    body.startISO = startISO;
    body.endISO = endISO;
  } else if (date && start && end) {
    body.date = date;
    body.start = start;
    body.end = end;
  } else {
    throw new Error("Provide either startISO/endISO or date/start/end");
  }
  return jsonFetch(`/api/appointments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

async function cancel(id, { reason } = {}) {
  const body = { status: "Cancelled", reason };
  return jsonFetch(`/api/appointments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

export { list, create, reschedule, cancel };
