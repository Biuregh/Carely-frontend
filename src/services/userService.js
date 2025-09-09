import { jsonFetch } from "./http.js";

async function index() {
  return jsonFetch("/users");
}

async function listProviders() {
  return jsonFetch("/users/providers");
}

export { index, listProviders };
