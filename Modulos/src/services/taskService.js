// ============================================================
// src/services/taskService.js (Servicio de Tareas)
// Capa intermedia entre el frontend y la API REST.
// Convierte peticiones HTTP (fetch) en funciones reutilizables
// que consumen al Backend (src/controllers/tarea.controller.js).
// ============================================================
import { API_URL } from '../api/config';

export const taskService = {
    // --- Obtener TODAS las tareas ---
    // GET /tareas -> devuelve un array de tareas.
    async getTasks() {
        const res = await fetch(`${API_URL}/tareas`);
        if (!res.ok) throw new Error();
        return await res.json();
    },

    // --- Obtener tareas de un usuario ---
    // GET /tareas?idUsuario=N -> array filtrado.
    async getTasksByUserId(idUsuario) {
        const res = await fetch(`${API_URL}/tareas?idUsuario=${Number(idUsuario)}`);
        if (!res.ok) throw new Error();
        return await res.json();
    },

    // --- Crear una nueva tarea ---
    // POST /tareas -> envía { titulo, descripcion, estado, idUsuario, ... }
    async createTask(nuevaTarea) {
        const res = await fetch(`${API_URL}/tareas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea),
        });
        if (!res.ok) throw new Error("ErrorServidor");
        return await res.json();
    },

    // --- Cambiar el estado de una tarea (Kanban / botón estado) ---
    // PATCH /tareas/:id -> { estado }
    async updateTaskStatus(id, nuevoEstado) {
        const res = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!res.ok) throw new Error();
        return await res.json();
    },

    // --- Editar la descripción de una tarea ---
    // PATCH /tareas/:id -> { descripcion }
    async updateTaskDescription(id, descripcion) {
        const res = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion })
        });
        if (!res.ok) throw new Error();
        return await res.json();
    },

    // --- Eliminar una tarea ---
    // DELETE /tareas/:id -> 200 con { success: true }
    async deleteTask(id) {
        const res = await fetch(`${API_URL}/tareas/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        return true;
    }
};
