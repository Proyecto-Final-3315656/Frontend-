// ============================================================
// src/notification/notificationSystem.js
// Fachada de notificaciones: funciones de alto nivel
// showSuccess / showError / showInfo / showWarning que envuelven
// lanzarNotificacion con el tipo visual correspondiente.
// Se usa desde src/index.js y las vistas (tasks/usuarios/admin).
// ============================================================

import { lanzarNotificacion, limpiarNotificacion } from '../ui/notification';

// Cada función envuelve lanzarNotificacion con su tipo y duración.
export function showSuccess(mensaje) {
    lanzarNotificacion(mensaje, 'success', 3000);  // verde, 3s
}
export function showError(mensaje) {
    lanzarNotificacion(mensaje, 'error', 4500);   // rojo, 4.5s (más tiempo para leer)
}
export function showInfo(mensaje) {
    lanzarNotificacion(mensaje, 'info', 3000);    // azul
}
export function showWarning(mensaje) {
    lanzarNotificacion(mensaje, 'warning', 4000);  // naranja
}

// Limpia todas las notificaciones actuales.
export function clearNotifications() {
    limpiarNotificacion();
}

// Exportamos también lanzarNotificacion por si se necesita un tipo custom.
export { lanzarNotificacion };
