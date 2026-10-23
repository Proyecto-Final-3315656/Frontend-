import { API_URL } from "../api/config";

let token = sessionStorage.getItem("accessToken") || "";

export function setToken(value) {
  token = value || "";
  if (token) sessionStorage.setItem("accessToken", token);
  else sessionStorage.removeItem("accessToken");
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "No se pudo completar la solicitud");
    error.status = response.status;
    error.details = payload.errors || [];
    throw error;
  }
  return payload.data;
}
