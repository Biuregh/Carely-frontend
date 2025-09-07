import { API, authHeader } from "./http";

async function index() {
  const res = await fetch(`${API}/users`, { headers: authHeader() });
  const data = await res.json();
  if (data.err) throw new Error(data.err);
  return data;
}

async function listProviders() {
  const res = await fetch(`${API}/users/providers`, {
    headers: authHeader(),
    credentials: "include",
  });
  return res.json();
}

export { index, listProviders };
