import { jsonFetch } from "./http.js";
import { toISO, minutesDiff } from "../utils/datetime.js";

function mockData() {
  const d = (y, m, day, h, mi) => new Date(y, m - 1, day, h, mi);
  return [
    {
      id: "1",
      code: "APT-001",
      status: "Scheduled",
      patient: { name: "Sarah Johnson", email: "sarah.j@email.com" },
      provider: { name: "Dr. Emily Rodriguez" },
      reason: "Annual Physical",
      startISO: d(2024, 1, 19, 10, 0).toISOString(),
      endISO: d(2024, 1, 19, 11, 0).toISOString(),
    },
    {
      id: "2",
      code: "APT-002",
      status: "Confirmed",
      patient: { name: "Michael Chen", email: "m.chen@email.com" },
      provider: { name: "Dr. Sarah Johnson" },
      reason: "Follow-up Visit",
      startISO: d(2024, 1, 17, 14, 30).toISOString(),
      endISO: d(2024, 1, 17, 15, 0).toISOString(),
    },
    {
      id: "3",
      code: "APT-003",
      status: "Scheduled",
      patient: { name: "Emma Rodriguez", email: "emma.r@email.com" },
      provider: { name: "Dr. Michael Chen" },
      reason: "Specialist Consultation",
      startISO: d(2024, 1, 21, 11, 30).toISOString(),
      endISO: d(2024, 1, 21, 12, 15).toISOString(),
    },
    {
      id: "4",
      code: "APT-004",
      status: "Scheduled",
      patient: { name: "David Kim", email: "d.kim@email.com" },
      provider: { name: "Dr. David Kim" },
      reason: "Cardiology Consultation",
      startISO: d(2024, 1, 24, 9, 0).toISOString(),
      endISO: d(2024, 1, 24, 9, 45).toISOString(),
    },
    {
      id: "5",
      code: "APT-005",
      status: "Completed",
      patient: { name: "Lisa Anderson", email: "l.anderson@email.com" },
      provider: { name: "Dr. Lisa Anderson" },
      reason: "General Consultation",
      startISO: d(2024, 1, 14, 15, 0).toISOString(),
      endISO: d(2024, 1, 14, 15, 30).toISOString(),
    },
  ];
}

async function listAll() {
  return mockData();
}

async function search({ by, term }) {
  const all = mockData();
  const t = String(term || "")
    .trim()
    .toLowerCase();
  if (!t) return all;
  return all.filter((apt) => {
    if (by === "patient")
      return (apt.patient?.name || "").toLowerCase().includes(t);
    if (by === "provider")
      return (apt.provider?.name || "").toLowerCase().includes(t);
    return false;
  });
}

async function reschedule(id, { date, start, end, startISO, endISO }) {
  const body = {
    startISO: startISO || (date && start ? toISO(date, start) : undefined),
    endISO: endISO || (date && end ? toISO(date, end) : undefined),
  };
  try {
    return await jsonFetch(`/api/appointments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    });
  } catch {
    return { ok: true, offline: true };
  }
}

async function cancel(id, { reason } = {}) {
  const body = { status: "Cancelled", reason };
  try {
    return await jsonFetch(`/api/appointments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    });
  } catch {
    return { ok: true, offline: true };
  }
}

export { listAll, search, reschedule, cancel, minutesDiff };
