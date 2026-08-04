// ============================================================
// src/ui/toInsertIntoTable.js
// Construye el contenido HTML de una fila de la tabla de tareas
// (5 columnas: IdUsuario, Nombre, Descripción, Estado y Acciones).
// La capa tasksToTable.js inserta esta fila y le enlaza los handlers.
// ============================================================
import { getStatusConfig } from '../utils/statusMapper';

// --- Construye una <tr> con los datos de una tarea ---
// idTarea: id de la tarea (data-id)
// nombre: nombreUsuario | idUsuario | descripcion | estado
export function buildRowHtml(idTarea, nombre, idUsuario, descripcion, estado) {
    // Colores/estilos del estado (Pendiente/En Proceso/Completada).
    const { colorEstado, textoBotonEstado, estiloDecoracionTexto, bgColorBoton } = getStatusConfig(estado);

    const fila = document.createElement('tr');
    fila.dataset.id = idTarea; // para identificar la tarea al editar/eliminar
    fila.innerHTML = `
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">
          ${idUsuario}
          <!-- Botón de borrado de USUARIO (cascada: usuario + sus tareas) -->
          <button class="btn-borrar-usuario-fila" data-id-usuario="${idUsuario}" title="Eliminar este usuario y todas sus tareas" style="margin-left:6px;padding:2px 6px;font-size:12px;">🗑</button>
        </td>
        <td style="padding: 10px; border: 1px solid #ddd;">${nombre}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-decoration: ${estiloDecoracionTexto}" class="descripcion-celda">${descripcion}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">
          <span class="estado-tag" style="color: ${colorEstado}; font-weight: bold;">${estado}</span>
        </td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
          <button class="btn-estado" style="background-color: ${bgColorBoton}; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-right: 2px;">${textoBotonEstado}</button>
          <button class="btn-editar">Editar</button>
          <button class="btn-eliminar">Eliminar</button>
          <button class="btn-borrar-usuario" title="Eliminar este usuario y todas sus tareas">🗑 Usuario</button>
        </td>
    `;
    return fila;
}
