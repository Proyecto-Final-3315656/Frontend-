// ============================================================
// src/services/userService.js (Servicio de Usuario)
// Capa intermedia entre el frontend y la API: convierte las
// peticiones HTTP (fetch) en llamadas a funciones reutilizables.
// Aquí se consume el Backend (src/controllers/usuario.controller.js).
// ============================================================

import { API_URL } from '../api/config';

export const userService = {
    // --- Obtener un usuario por su ID ---
    // GET /users/:id  -> devuelve objeto { id, name, email, telefono }
    async getUserById(id) {
        const res = await fetch(`${API_URL}/users/${Number(id)}`);
        if (!res.ok) throw new Error("No existe");
        return await res.json();
    },

    // --- Listar TODOS los usuarios ---
    // GET /usuarios -> devuelve { success, data: [...] }
    async getAllUsers() {
        const res = await fetch(`${API_URL}/usuarios`);
        if (!res.ok) throw new Error("Error al obtener usuarios");
        const json = await res.json();
        // Normalizamos: siempre trabajamos con un array en "data"
        return json.data || [];
    },

    // --- Crear un nuevo usuario ---
    // POST /usuarios -> envía { nombre, email, telefono }
    async createUser(usuario) {
        const res = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario),
        });
        if (!res.ok) throw new Error("ErrorServidor");
        const json = await res.json();
        return json.data || json; // devuelve el usuario creado
    },

    // --- Eliminar un usuario (y sus tareas, en cascada, desde el backend) ---
    // DELETE /usuarios/:id -> persiste en BD; el controller borra también las
    // tareas del usuario para que desaparezcan de la tabla y del Kanban.
    async deleteUser(id) {
        const res = await fetch(`${API_URL}/usuarios/${Number(id)}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error("ErrorServidor");
        return await res.json();
    },
};