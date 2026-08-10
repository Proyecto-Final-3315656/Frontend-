import { buildRowHtml } from './toInsertIntoTable';
import { actualizarContadorInterfaz } from './showEmptyTask';
import { taskService } from '../services';
import { userService } from '../services';
import { lanzarNotificacion } from './notification';
import { renderUsuarios } from './usuariosView';
import { getStatusConfig, getSiguienteEstado } from '../utils';
import { abrirModalEditarTarea, abrirModalConfirmar } from './modal';

const tablaTareas = document.getElementById('messagesContainer');
let localState = { total: 0 };

export function setTotalTareasState(total) {
    localState.total = total;
}

export function agregarFilaTabla(tarea) {
    if (localState.total === 0 && tablaTareas) tablaTareas.innerHTML = '';

    const fila = buildRowHtml(tarea.id, tarea.nombreUsuario, tarea.idUsuario, tarea.descripcion, tarea.estado);

    fila.querySelector('.btn-estado').onclick = () => handlerCambiarEstado(tarea.id, tarea.estado, fila);
    fila.querySelector('.btn-editar').onclick = () => handlerEditar(tarea.id, fila);
    fila.querySelector('.btn-eliminar').onclick = () => handlerEliminar(tarea.id, fila);
    // Botón 🗑 Usuario: elimina el usuario y todas sus tareas (cascada).
    const btnUsuario = fila.querySelector('.btn-borrar-usuario-fila');
    if (btnUsuario) {
        btnUsuario.onclick = () => handlerEliminarUsuario(tarea.idUsuario, tarea.nombreUsuario);
    }
    // Botón "🗑 Usuario": elimina el usuario y todas sus tareas (cascada).
    fila.querySelector('.btn-borrar-usuario').onclick = () => handlerEliminarUsuario(tarea.idUsuario, tarea.nombreUsuario);

    tablaTareas.appendChild(fila);
    localState.total++;
    actualizarContadorInterfaz(localState.total);
}

export function limpiarTabla() {
    if (tablaTareas) tablaTareas.innerHTML = '';
    localState.total = 0;
}

async function handlerCambiarEstado(id, estadoActual, filaHTML) {
    const nuevoEstado = getSiguienteEstado(estadoActual);
    try {
        const tAct = await taskService.updateTaskStatus(id, nuevoEstado);
        // Notificación toast verde (formato legacy que también soporta el nuevo system).
        lanzarNotificacion(`Estado de tarea cambiado a: ${tAct.estado}`, "green", "#e8f8f5");

        const celdaTexto = filaHTML.querySelector('.descripcion-celda');
        const etiquetaEstado = filaHTML.querySelector('.estado-tag');
        const botonEstado = filaHTML.querySelector('.btn-estado');
        const config = getStatusConfig(tAct.estado);

        etiquetaEstado.innerText = tAct.estado;
        etiquetaEstado.style.color = config.colorEstado;
        celdaTexto.style.textDecoration = config.estiloDecoracionTexto.split(';')[0];
        celdaTexto.style.color = tAct.estado === "Completada" ? "gray" : "black";
        botonEstado.innerText = config.textoBotonEstado;
        botonEstado.style.backgroundColor = config.bgColorBoton;

        botonEstado.onclick = () => handlerCambiarEstado(id, tAct.estado, filaHTML);

        // Si el Kanban está visible, refrescamos el tablero para reflejar el cambio.
        if (document.getElementById('seccion-administrador')?.classList.contains('activo')) {
            const adminMod = await import('../ui/adminView');
            adminMod.renderKanban();
        }
    } catch {
        lanzarNotificacion("Error: No se pudo cambiar el estado de la tarea.", "red", "#fdedec");
    }
}

async function handlerEditar(id, filaHTML) {
    const celdaTexto = filaHTML.querySelector('.descripcion-celda');
    const descripcionActual = celdaTexto.innerText || '';

    // Abrimos el modal bonito en vez del prompt() nativo.
    abrirModalEditarTarea(descripcionActual, async (modTexto) => {
        try {
            const tAct = await taskService.updateTaskDescription(id, modTexto);
            celdaTexto.innerText = tAct.descripcion;
            lanzarNotificacion("¡La tarea ha sido actualizada con éxito!", "green", "#e8f8f5");

            // Refresco del Kanban si está activo.
            if (document.getElementById('seccion-administrador')?.classList.contains('activo')) {
                const adminMod = await import('../ui/adminView');
                adminMod.renderKanban();
            }
        } catch {
            lanzarNotificacion("Error: No se pudo salvar la actualización.", "red", "#fdedec");
        }
    });
}

async function handlerEliminar(id, filaHTML) {
    // Confirmación con modal bonito en vez del confirm() nativo.
    abrirModalConfirmar(
        'Eliminar tarea',
        '¿Está seguro de que desea eliminar esta tarea? Esta acción no se puede deshacer.',
        'danger',
        async () => {
            try {
                await taskService.deleteTask(id);
                filaHTML.remove();
                lanzarNotificacion("¡Tarea eliminada de la base de datos!", "green", "#e8f8f5");
                localState.total--;
                actualizarContadorInterfaz(localState.total);

                // Refresco del Kanban si está activo.
                if (document.getElementById('seccion-administrador')?.classList.contains('activo')) {
                    const adminMod = await import('../ui/adminView');
                    adminMod.renderKanban();
                }
            } catch {   
                lanzarNotificacion("Error de red al intentar eliminar la tarea.", "red", "#fdedec");
            }
        }
    );
}

// --- ELIMINAR USUARIO (cascada): borra el usuario y todas sus tareas ---
// Aparece en la tabla de tareas: el usuario desaparece de la tabla, de la
// lista de Usuarios y del Kanban en un solo clic (confirmado con modal).
async function handlerEliminarUsuario(idUsuario, nombreUsuario) {
    // Modal bonito de confirmación (no el confirm() nativo).
    abrirModalConfirmar(
        'Eliminar usuario',
        `¿Eliminar a "${nombreUsuario}" y TODAS sus tareas? Esta acción no se puede deshacer.`,
        'danger',
        async () => {
            try {
                // DELETE /usuarios/:id — el backend borra el usuario + sus tareas (cascada).
                await userService.deleteUser(idUsuario);
                lanzarNotificacion(`Usuario "${nombreUsuario}" y sus tareas eliminados.`, "green", "#e8f8f5");

                // Refrescamos la tabla de tareas con los datos actualizados de la BD.
                await refrescarTablaTareas();

                // Refrescamos la lista de usuarios (queda fuera el eliminado).
                renderUsuarios();

                // Si el Kanban está activo, también se actualiza el tablero.
                if (document.getElementById('seccion-administrador')?.classList.contains('activo')) {
                    const adminMod = await import('../ui/adminView');
                    adminMod.renderKanban();
                }
            } catch {
                lanzarNotificacion("Error de red al intentar eliminar el usuario.", "red", "#fdedec");
            }
        }
    );
}

// --- Recarga la tabla de tareas desde la BD (después de borrar usuario/tarea) ---
async function refrescarTablaTareas() {
    try {
        const tareas = await taskService.getTasks(); // GET /tareas (todas)
        limpiarTabla();                              // vacía la tabla + contador
        tareas.forEach(t => agregarFilaTabla(t));    // vuelve a dibujar cada fila
    } catch {
        lanzarNotificacion("No se pudieron recargar las tareas.", "red", "#fdedec");
    }
}

// Exponemos refrescarTablaTareas para que index.js (carga inicial) pueda reusarla
// y mantener un único punto de refetch de la tabla de tareas.
export { refrescarTablaTareas };
