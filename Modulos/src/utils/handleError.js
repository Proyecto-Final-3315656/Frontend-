// ============================================================
// src/utils/handleError.js
// Genera una notificación de error genérica a partir de un mensaje
// (formato legacy que el system de toasts entiende).
// ============================================================

// --- Envuelve un mensaje de error en la estructura de notificación ---
export function handleGenericError(mensaje) {
    return { texto: mensaje, color: "red", fondo: "#fdedec" };
}
