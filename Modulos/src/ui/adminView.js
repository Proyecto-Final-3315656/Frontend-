// ============================================================
// src/ui/adminView.js
// VISTA del "Administrador": tablero Kanban.
// Organiza las tareas en columnas según su estado
// (Pendiente, En Proceso, Completada). Incluye Drag & Drop para
// cambiar el estado moviendo las tarjetas entre columnas.
// ============================================================

import { taskService } from '../services';
import { showSuccess, showError } from '../notification/notificationSystem';

const board = document.getElementById('kanbanBoard');

// Las 3 columnas del kanban y su color asociado.
const COLUMNAS = [
    { estado: 'Pendiente', color: '#f59e0b', titulo: '⏳ Pendiente' },
    { estado: 'En Proceso', color: '#3b82f6', titulo: '⚙️ En Proceso' },
    { estado: 'Completada', color: '#22c55e', titulo: '✅ Completada' },
];

// --- Renderiza el tablero Kanban con las tareas actuales ---
export async function renderKanban() {
    try {
        const tareas = await taskService.getTasks(); // GET /tareas
        board.innerHTML = '';

        // Distribuimos las tareas en la columna correcta según su estado.
        const porEstado = {};
        COLUMNAS.forEach(c => porEstado[c.estado] = []);
        tareas.forEach(t => {
            const clave = (t.estado && COLUMNAS.find(c => c.estado === t.estado)) ? t.estado : 'Pendiente';
            porEstado[clave].push(t);
        });

        // NOTA: antes se usaban IDs con espacios (ej: cont-En Proceso) y se
        // buscaba con board.querySelector('#cont-En Proceso'). El espacio en un
        // selector ID se interpreta como descendencia y devolvía null, lanzando
        // TypeError. Ahora se usan referencias a la propia columna (sin IDs).
        // Creamos una columna por cada estado.
        COLUMNAS.forEach(col => {
            const columna = document.createElement('div');
            columna.className = 'kanban-columna';
            columna.dataset.estado = col.estado; // importante para el D&D
            columna.innerHTML = `
                <h3 class="kanban-titulo" style="color:${col.color}">${col.titulo}</h3>
                <div class="kanban-tarjetas" data-estado="${col.estado}"></div>
                <div class="kanban-contador" style="color:${col.color}">0</div>
            `;
            board.appendChild(columna);

            // Zona de tarjetas y contador: referenciados SOBRE la columna
            // (scoped), sin IDs ni selectores con espacios.
            const zona = columna.querySelector('.kanban-tarjetas');
            const contador = columna.querySelector('.kanban-contador');
            contador.textContent = porEstado[col.estado].length;
            porEstado[col.estado].forEach(t => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'kanban-tarjeta';
                tarjeta.draggable = true;             // habilita el arrastre
                tarjeta.dataset.id = t.id;            // guardamos el id de la tarea
                tarjeta.dataset.estado = t.estado || 'Pendiente';
                tarjeta.innerHTML = `
                    <div class="kanban-titulo-tarea">${t.titulo || t.descripcion || 'Sin título'}</div>
                    <div class="kanban-descripcion">${t.descripcion || ''}</div>
                    <div class="kanban-estado" style="color:${col.color}">${t.estado || 'Pendiente'}</div>
                `;
                zona.appendChild(tarjeta);
            });
        });

        // --- Drag & Drop: cambiar estado al soltar la tarjeta ---
        board.querySelectorAll('.kanban-tarjeta').forEach(t => {
            t.addEventListener('dragstart', () => {
                t.classList.add('arrastrando'); // resaltado mientras se arrasta
            });
            t.addEventListener('dragend', () => t.classList.remove('arrastrando'));
        });
        board.querySelectorAll('.kanban-columna').forEach(col => {
            col.addEventListener('dragover', e => e.preventDefault()); // permite soltar
            col.addEventListener('drop', async (e) => {
                const tarjeta = document.querySelector('.kanban-tarjeta.arrastrando');
                if (!tarjeta) return;
                const nuevoEstado = col.dataset.estado; // estado destino
                // Si el estado cambió, actualizamos en la API.
                if (nuevoEstado !== tarjeta.dataset.estado) {
                    try {
                        await taskService.updateTaskStatus(tarjeta.dataset.id, nuevoEstado);
                        showSuccess(`Tarea pasada a "${nuevoEstado}"`);
                        renderKanban(); // recargamos el tablero
                    } catch {
                        showError('No se pudo actualizar el estado');
                    }
                }
            });
        });
    } catch (e) {
        showError('Error al cargar el tablero');
    }
}

// --- Inicializa el tablero al entrar en la sección Administrador ---
export function initAdmin() {
    if (!board) return;
    renderKanban();
}

export default { initAdmin, renderKanban };