// ============================================================
// src/sorting/sortControls.js
// Lógica de ORDENAMIENTO de tareas. Lee los criterios desde el DOM
// y devuelve una copia nueva (sin mutar el original) de tareas ordenadas.
// ============================================================

// --- Ordena una copia del array según criterio y dirección ---
// criterio: 'fecha' | 'nombre' | 'estado'   orden: 'asc' | 'desc'
export function sortTasks(tasks, criterio, orden = 'asc') {
    const copia = [...tasks]; // no mutar la lista original
    copia.sort((a, b) => {
        let comparacion = 0;
        if (criterio === 'fecha') {
            // Ordena por createdAt (fecha de creación); 0 = epoch si falta.
            const fechaA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const fechaB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            comparacion = fechaA - fechaB;
        } else if (criterio === 'nombre') {
            // Ordena alfabéticamente por descripción de la tarea.
            comparacion = (a.descripcion || '').localeCompare(b.descripcion || '');
        } else if (criterio === 'estado') {
            // Ordena por prioridad: Pendiente < En Proceso < Completada.
            const ordenEstados = { 'Pendiente': 1, 'En Proceso': 2, 'Completada': 3 };
            comparacion = (ordenEstados[a.estado] || 0) - (ordenEstados[b.estado] || 0);
        }
        // 'desc' invierte el sentido de la comparación.
        return orden === 'desc' ? -comparacion : comparacion;
    });
    return copia;
}

// --- Lee el criterio y la dirección desde los <select> del DOM ---
export function getSortConfigFromDOM() {
    const criterio = document.getElementById('sortCriterio')?.value || 'fecha';
    const orden = document.getElementById('sortOrden')?.value || 'asc';
    return { criterio, orden };
}
