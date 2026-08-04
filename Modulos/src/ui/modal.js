// ============================================================
// src/ui/modal.js
// Sistema de MODALES personalizados (reemplaza prompt() / confirm()).
// Ofrece diálogos bonitos con el mismo tema de la app (dark), animados
// con entrada/salida, backdrop blur, cierre con click fuera o ESC.
//
// API:
//   abrirModalEditarTarea(descripcionActual, onGuardar)  -> (texto) => void
//   abrirModalConfirmar(titulo, mensaje, tipo, onConfirmar) -> () => void
// ============================================================

// Creamos el overlay y la caja del modal en el DOM una sola vez.
// Se reutilizan entre llamadas para no saturar el árbol DOM.
let overlay = null;

function crearEstructura() {
    // Overlay oscuro que cubre toda la pantalla.
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <span class="modal-icon"></span>
                <h3 class="modal-titulo"></h3>
                <button class="modal-cerrar" type="button">&times;</button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-botones"></div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        // Cerrar solo si se hace click en el overlay (no en la caja).
        if (e.target === overlay) cerrarModal();
    });
    document.body.appendChild(overlay);

    // Cierre con tecla Escape.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });

    // Botón × de cerrar.
    overlay.querySelector('.modal-cerrar').addEventListener('click', cerrarModal);
}

function cerrarModal() {
    if (!overlay) return;
    overlay.classList.add('modal-salida'); // animación de salida
    overlay.addEventListener('transitionend', () => {
        if (overlay && overlay.parentNode) overlay.remove();
        overlay = null;
    }, { once: true });
}

// --- Modal para EDITAR la descripción de una tarea (reemplaza prompt) ---
// descripcionActual: texto que ya tiene la tarea.
// onGuardar(texto): callback que persiste el cambio (PATCH al backend).
export function abrirModalEditarTarea(descripcionActual, onGuardar) {
    if (!overlay) crearEstructura();

    const titulo = overlay.querySelector('.modal-titulo');
    const icono = overlay.querySelector('.modal-icon');
    const body = overlay.querySelector('.modal-body');
    const botones = overlay.querySelector('.modal-botones');

    titulo.textContent = 'Editar tarea';
    icono.textContent = '✏️';
    body.innerHTML = '';
    botones.innerHTML = '';

    // Textarea para modificar la descripción (precargada).
    const textarea = document.createElement('textarea');
    textarea.className = 'modal-input';
    textarea.placeholder = 'Descripción de la tarea';
    textarea.value = descripcionActual || '';
    textarea.rows = 3;
    body.appendChild(textarea);

    // Mensajito de validación (se muestra si está vacío).
    const aviso = document.createElement('small');
    aviso.style.cssText = 'color:#f87171;display:none;margin-top:4px;';
    aviso.textContent = 'La descripción no puede estar vacía.';
    body.appendChild(aviso);

    // Botón Guardar (acción principal).
    const btnGuardar = document.createElement('button');
    btnGuardar.type = 'button';
    btnGuardar.textContent = 'Guardar';
    btnGuardar.className = 'btn-modal-primary';
    btnGuardar.onclick = () => {
        const texto = textarea.value.trim();
        if (!texto) {            // validación cliente
            aviso.style.display = 'block';
            return;
        }
        cerrarModal();           // cerramos primero
        onGuardar(texto);        // persistimos vía callback
    };
    botones.appendChild(btnGuardar);

    // Botón Cancelar.
    const btnCancelar = document.createElement('button');
    btnCancelar.type = 'button';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.className = 'btn-modal-secondary';
    btnCancelar.onclick = cerrarModal;
    botones.appendChild(btnCancelar);

    overlay.classList.add('modal-activo'); // aparece con animación
}

// --- Modal de confirmación (reemplaza confirm) ---
// titulo: encabezado. mensaje: texto. tipo: 'danger'|'info'.
// onConfirmar: acción al aceptar.
export function abrirModalConfirmar(titulo, mensaje, tipo = 'info', onConfirmar) {
    if (!overlay) crearEstructura();

    const tituloEl = overlay.querySelector('.modal-titulo');
    const icono = overlay.querySelector('.modal-icon');
    const body = overlay.querySelector('.modal-body');
    const botones = overlay.querySelector('.modal-botones');

    tituloEl.textContent = titulo;
    icono.textContent = tipo === 'danger' ? '⚠️' : 'ℹ️';
    body.innerHTML = `<p class="modal-mensaje">${mensaje}</p>`;
    botones.innerHTML = '';

    const btnSi = document.createElement('button');
    btnSi.type = 'button';
    btnSi.textContent = tipo === 'danger' ? 'Sí, eliminar' : 'Confirmar';
    btnSi.className = tipo === 'danger' ? 'btn-modal-primary danger' : 'btn-modal-primary';
    btnSi.onclick = () => {
        cerrarModal();
        onConfirmar();
    };
    botones.appendChild(btnSi);

    const btnNo = document.createElement('button');
    btnNo.type = 'button';
    btnNo.textContent = 'Cancelar';
    btnNo.className = 'btn-modal-secondary';
    btnNo.onclick = cerrarModal;
    botones.appendChild(btnNo);

    overlay.classList.add('modal-activo');
}

export default { abrirModalEditarTarea, abrirModalConfirmar };
