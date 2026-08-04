// ============================================================
// src/filters/filterBar.js
// Lógica de filtrado de tareas. Lee los filtros desde el DOM y
// devuelve un subconjunto de tareas que los cumplen.
// (Se separa de sorting/sortControls.js por responsabilidad).
// ============================================================

// --- Filtra un array de tareas por estado e idUsuario ---
// filtros = { estado?, idUsuario? } (null = "no filtrar")
export function applyFilters(tasks, filtros) {
    return tasks.filter(tarea => {
        // Si hay filtro de estado, descarta las que no coincidan.
        if (filtros.estado && tarea.estado !== filtros.estado) return false;
        // Si hay filtro de usuario, descarta las que no coincidan.
        if (filtros.idUsuario && tarea.idUsuario !== Number(filtros.idUsuario)) return false;
        return true; // pasa ambos filtros
    });
}

// --- Lee los valores de filtro desde los <select>/<input> del DOM ---
export function getFiltrosFromDOM() {
    const estado = document.getElementById('filterEstado')?.value || '';
    const idUsuario = document.getElementById('filterUsuario')?.value || '';
    // Normalizamos: "" -> null (no filtrar ese criterio).
    return {
        estado: estado || null,
        idUsuario: idUsuario || null
    };
}

// --- Indica si hay al menos un filtro activo ---
export function hayFiltrosActivos(filtros) {
    return !!(filtros.estado || filtros.idUsuario);
}
