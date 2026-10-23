import { request, setToken } from "./api";

export const authService = {
  async login(email, password) {
    const session = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setToken(session.token);
    return session.user;
  },
  me: () => request("/auth/me"),
  logout: () => setToken(""),
};

export const usersService = {
  list: () => request("/usuarios"),
  create: (data) => request("/usuarios", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id) => request(`/usuarios/${id}`, { method: "DELETE" }),
};

export const tasksService = {
  list: () => request("/tareas"),
  create: (data) => request("/tareas", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/tareas/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id) => request(`/tareas/${id}`, { method: "DELETE" }),
};
