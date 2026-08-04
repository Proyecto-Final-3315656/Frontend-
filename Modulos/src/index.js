// ============================================================
// src/index.js - ARCHIVO DE INICIO del frontend (punto de entrada)
// Aquí se conecta todo: servicios, utilidades, vistas y el
// controlador principal que orquesta la aplicación.
// También se configura la navegación entre pestañas.
// ============================================================

import { userService, taskService } from './services';
import {
    lanzarNotificacion,
    limpiarNotificacion,
    clearTaskInput,
    actualizarContadorInterfaz,
    agregarFilaTabla,
    limpiarTabla,
    // Nuevas vistas importadas
    initUsuarios,
    renderUsuarios,
    initAdmin,
    renderKanban
} from './ui';
import { validateIdInput, handleApiError, handleGenericError } from './utils';
import { applyFilters, getFiltrosFromDOM } from './filters/filterBar';
import { sortTasks, getSortConfigFromDOM } from './sorting/sortControls';
import { showSuccess, showError, showInfo, showWarning } from './notification/notificationSystem';
import { exportToJSON } from './export/exportTasks';

// ============================================================
// NAVEGACIÓN POR PESTAÑAS
// Cambia la sección visible (#seccion-tareas / usuarios / administrador)
// según la pestaña pulsada y refresca la vista activa.
// ============================================================
const tabsNav = document.getElementById('tabsNav');

function cambiarPestana(seccion) {
    // Ocultar todas las secciones y quitar "activo" de las pestañas.
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activo'));
    document.querySelectorAll('.tab-boton').forEach(b => b.classList.remove('activo'));

    // Mostrar la sección solicitada y marcar su pestaña.
    const destino = document.getElementById(seccion);
    if (destino) destino.classList.add('activo');

    // Actualizar vistas según la pestaña activa.
    if (seccion === 'seccion-usuarios') {
        initUsuarios();            // renderiza + enlaza formulario
    } else if (seccion === 'seccion-administrador') {
        initAdmin();               // renderiza el kanban
    }
}

// Escuchamos clics en la barra de navegación de pestañas.
if (tabsNav) {
    tabsNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-boton'); // el botón pulsado
        if (!btn) return;
        cambiarPestana(btn.dataset.seccion);
        // Resaltamos el botón activo.
        document.querySelectorAll('.tab-boton').forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
    });
}

// Referencias a elementos del formulario de tareas.
const formBusqueda = document.getElementById('messageForm');
const inputId = document.getElementById('userName');
const inputTareaDesc = document.getElementById('userMessage');

function debounce(fn, delay = 400) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

let todasLasTareas = [];

function mostrarNotificacion(notif) {
    // notif puede ser {texto, color, fondo} (legacy) o {texto, tipo} (nuevo)
    if (notif && notif.texto) {
        // Si tiene tipo nuevo, usamos la función tipada; si no, fallback a showError por color rojo.
        const tipo = notif.tipo || (notif.color === 'red' ? 'error' : (notif.color === 'green' ? 'success' : 'info'));
        lanzarNotificacion(notif.texto, tipo, 3500);
    }
}   

function renderizarTareas(tareas) {
    limpiarTabla();
    if (tareas.length === 0) {
        actualizarContadorInterfaz(0);
        return;
    }
    tareas.forEach(t => agregarFilaTabla(t));
}

function aplicarFiltrosYSort() {
    const filtros = getFiltrosFromDOM();
    const { criterio, orden } = getSortConfigFromDOM();
    let resultado = applyFilters(todasLasTareas, filtros);
    resultado = sortTasks(resultado, criterio, orden);
    renderizarTareas(resultado);
}

if (inputId) {
    inputId.addEventListener('input', debounce(async function() {
        const id = this.value.trim();
        if (id === "") {
            limpiarNotificacion();
            cargarTareasIniciales();
            return;
        }
        try {
            const usuario = await userService.getUserById(id);
            showInfo(`Usuario encontrado: ${usuario.name}`);
            await cargarTareasDeUsuario(usuario.id, usuario.name);
        } catch {
            lanzarNotificacion("Usuario no encontrado", "gray", "#f5f5f5");
            todasLasTareas = [];
            limpiarTabla();
            actualizarContadorInterfaz(0);
        }
    }));
}

async function cargarTareasDeUsuario(idUsuario, nombreUsuario) {
    try {
        todasLasTareas = [];
        limpiarTabla();
        const tareas = await taskService.getTasksByUserId(idUsuario);
        todasLasTareas = tareas;

        if (tareas.length > 0) {
            aplicarFiltrosYSort();
            showInfo(`Visualizando tareas de: ${nombreUsuario}`);
        } else {
            actualizarContadorInterfaz(0);
            showWarning(`El usuario ${nombreUsuario} no tiene tareas asignadas.`);
        }
    } catch {
        mostrarNotificacion(handleGenericError("Error al intentar cargar el historial de tareas."));
    }
}

if (formBusqueda) {
    formBusqueda.addEventListener('submit', async function(e) {
        e.preventDefault();

        const idBuscado = validateIdInput(inputId.value);
        const tareaTexto = inputTareaDesc.value.trim();

        if (idBuscado === "") {
            mostrarNotificacion(handleGenericError("Error: Por favor ingrese un ID de Usuario."));
            return;
        }

        if (tareaTexto === "") {
            showWarning("Escribe una descripción para guardar la tarea.");
            return;
        }

        try {
            const usuario = await userService.getUserById(idBuscado);
            const nuevaTarea = {
                idUsuario: Number(usuario.id),
                nombreUsuario: usuario.name,
                descripcion: tareaTexto,
                estado: "Pendiente",
                createdAt: new Date().toISOString()
            };

            const tFinal = await taskService.createTask(nuevaTarea);
            showSuccess(`¡Tarea registrada exitosamente para ${tFinal.nombreUsuario}!`);
            await cargarTareasDeUsuario(tFinal.idUsuario, tFinal.nombreUsuario);
            clearTaskInput();
        } catch (error) {
            mostrarNotificacion(handleApiError(error));
        }
    });
}

async function cargarTareasIniciales() {
    try {
        todasLasTareas = [];
        limpiarTabla();
        const tareas = await taskService.getTasks();
        todasLasTareas = tareas;

        if (tareas.length > 0) {
            aplicarFiltrosYSort();
        } else {
            actualizarContadorInterfaz(0);
        }
        // Si el kanban está visible, también refrescamos la sección administrador.
        if (document.getElementById('seccion-administrador')?.classList.contains('activo')) {
            renderKanban();
        }
    } catch {
        console.log("Servidor vacío o desconectado. Esperando interacciones.");
    }
}

document.getElementById('btnApplyFilter')?.addEventListener('click', () => {
    if (todasLasTareas.length > 0) {
        aplicarFiltrosYSort();
    }
});

document.getElementById('btnClearFilter')?.addEventListener('click', () => {
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterUsuario').value = '';
    if (todasLasTareas.length > 0) {
        aplicarFiltrosYSort();
    }
    showInfo("Filtros limpiados.");
});

document.getElementById('btnApplySort')?.addEventListener('click', () => {
    if (todasLasTareas.length > 0) {
        aplicarFiltrosYSort();
    }
});

document.getElementById('btnExport')?.addEventListener('click', () => {
    const tabla = document.getElementById('messagesContainer');
    const filas = tabla ? tabla.querySelectorAll('tr:not(#emptyState)') : [];
    if (filas.length === 0) {
        showError("No hay tareas visibles para exportar.");
        return;
    }

    const filtros = getFiltrosFromDOM();
    const { criterio, orden } = getSortConfigFromDOM();
    let visibles = applyFilters(todasLasTareas, filtros);
    visibles = sortTasks(visibles, criterio, orden);

    exportToJSON(visibles);
    showSuccess(`Se exportaron ${visibles.length} tareas.`);
});

// Al cargar la página: iniciamos con datos y la navegación por pestañas.
document.addEventListener("DOMContentLoaded", () => {
    cargarTareasIniciales();   // carga tareas en la tabla
    initUsuarios();           // inicializa la sección de usuarios
    // NOTA: el kanban se inicializa cuando se abra su pestaña (cambiarPestana)
});
