const TZ = "America/New_York";
const pad = (n) => String(n).padStart(2, "0");

function toLocalRFC3339NoZ(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
}
function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toTimeStr(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toISO(dateStr, timeHHmm) {
  return new Date(`${dateStr}T${timeHHmm}:00`).toISOString();
}
function minutesDiff(aISO, bISO) {
  const a = new Date(aISO).getTime();
  const b = new Date(bISO).getTime();
  return Math.max(0, Math.round((b - a) / 60000));
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString();
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export {
  TZ,
  pad,
  toLocalRFC3339NoZ,
  toDateStr,
  toTimeStr,
  toISO,
  minutesDiff,
  fmtDate,
  fmtTime,
};
