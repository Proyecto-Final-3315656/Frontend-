// ============================================================
// src/ui/usuariosView.js
// VISTA de la sección de Usuarios. Se encarga de:
//   - Renderizar el listado de usuarios en la tabla.
//   - Manejar el formulario de creación de usuarios.
// Usa userService (src/services/userService.js).
// ============================================================

import { userService } from '../services';
import { showSuccess, showError, showInfo } from '../notification/notificationSystem';

const contenedor = document.getElementById('listaUsuarios');
const form = document.getElementById('formUsuario');

// Flag de guarda: initUsuarios se llama en DOMContentLoaded y en cada cambio
// de pestaña. Sin este flag se registrarían listeners de submit duplicados y
// al enviar el formulario se crearían N usuarios idénticos en la BD.
let usuariosInicializado = false;

// --- Renderiza la tabla de usuarios (filas dinámicas) ---
export async function renderUsuarios() {
    try {
        const usuarios = await userService.getAllUsers(); // GET /usuarios
        if (!usuarios.length) {
            contenedor.innerHTML = '<p class="vacias">No hay usuarios registrados.</p>';
            return;
        }
        // Construimos filas con nombre, email y teléfono.
        contenedor.innerHTML = `
            <table class="tabla-usuarios">
                <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th></tr></thead>
                <tbody>
                    ${usuarios.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.nombre}</td>
                            <td>${u.email}</td>
                            <td>${u.telefono || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    } catch (e) {
        showError('Error al cargar usuarios');
        contenedor.innerHTML = '<p class="vacias">No se pudieron cargar los usuarios.</p>';
    }
}

// --- Inicializa la sección de usuarios (render + submit) ---
// Se puede llamar muchas veces (pestaña activa) sin duplicar el submit.
export function initUsuarios() {
    if (!form || !contenedor) return; // no está montada, no hacemos nada

    // Siempre refrescamos la lista al entrar (refleja lo que hay en la BD).
    renderUsuarios();

    // El submit se enlaza SOLO la primera vez (evita duplicados en la BD).
    if (usuariosInicializado) return;
    usuariosInicializado = true;

    // --- Crear usuario al enviar el formulario (único listener) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = {
            nombre: document.getElementById('uNombre').value.trim(),
            email: document.getElementById('uEmail').value.trim(),
            telefono: document.getElementById('uTelefono').value.trim(),
        };
        try {
            await userService.createUser(datos); // POST /usuarios -> persiste en BD
            showSuccess('Usuario creado correctamente');
            form.reset();       // limpiamos el formulario
            renderUsuarios();   // recargamos la tabla (un registro por envío)
        } catch (e) {
            showError('No se pudo crear el usuario');
        }
    });
}

export default { initUsuarios, renderUsuarios };