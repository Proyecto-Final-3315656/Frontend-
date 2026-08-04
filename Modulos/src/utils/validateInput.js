// ============================================================
// src/utils/validateInput.js
// Validaciones ligeros del lado cliente antes de llamar al API.
// ============================================================

// --- Valida y convierte el input de "ID de usuario" de la búsqueda ---
// Devuelve un Number válido o "" (cadena vacía) para cancelar la búsqueda.
export function validateIdInput(id) {
    return id.trim() !== "" ? Number(id.trim()) : "";
}
