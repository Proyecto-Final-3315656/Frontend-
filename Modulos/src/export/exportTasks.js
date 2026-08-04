// ============================================================
// src/export/exportTasks.js
// Serializa el listado filtrado de tareas a un archivo JSON
// y dispara su descarga en el navegador.
// ============================================================

// --- Exporta un array de tareas a JSON y fuerza la descarga ---
export function exportToJSON(tasks, filename = 'tareas.json') {
    // Proyectamos solo los campos relevantes (evita datos internos).
    const data = tasks.map(({ id, idUsuario, nombreUsuario, descripcion, estado, createdAt }) => ({
        id, idUsuario, nombreUsuario, descripcion, estado, createdAt
    }));

    // Convertimos a JSON con indentación legible.
    const json = JSON.stringify(data, null, 2);
    // Creamos un Blob (blob de archivo) en memoria.
    const blob = new Blob([json], { type: 'application/json' });
    // URL temporal para enlazar la descarga.
    const url = URL.createObjectURL(blob);
    // <a> invisible que provoca la descarga al click().
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();                // dispara la descarga
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // libera la URL temporal
}
