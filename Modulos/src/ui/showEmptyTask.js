// ============================================================
// src/ui/showEmptyTask.js
// Mantiene en sincronía los indicadores de vacío de la tabla:
// el contador de tareas y la fila "No hay tareas registradas".
// ============================================================
const tablaTareas = document.getElementById('messagesContainer');
const contadorTexto = document.getElementById('messageCount');

// --- Actualiza el contador y, si no hay tareas, muestra el cartel ---
export function actualizarContadorInterfaz(totalTareas) {
    // Mensaje "N tareas registradas".
    if (contadorTexto) {
        contadorTexto.innerText = `${totalTareas} tareas registradas`;
    }

    // Si está vacía, renderiza la fila de emptyState.
    if (totalTareas === 0 && tablaTareas) {
        tablaTareas.innerHTML = `
            <tr id="emptyState">
                <td colspan="5" style="text-align: center; color: gray; padding: 20px;">
                    No hay tareas registradas en el sistema.
                </td>
            </tr>
        `;
    }
}
