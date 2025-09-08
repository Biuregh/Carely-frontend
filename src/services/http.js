const API = import.meta.env.VITE_API_BASE;

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function jsonFetch(
  path,
  { method = "GET", headers = {}, body, credentials = "include" } = {}
) {
  const res = await fetch(`${API}${path}`, {
    method,
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.err || data.error || res.statusText);
  return data;
}

export { API, authHeader, jsonFetch };
