// ============================================================
// src/utils/handleApiError.js
// Traduce los errores del servicio (mensajes técnicos) en
// notificaciones amigables del tipo { texto, color, fondo }
// (formato legacy que también entiende el system de toasts).
// ============================================================

// --- Mapea un error del cliente a una notificación visual ---
export function handleApiError(error) {
    // "No existe" -> usuario/id inválido.
    if (error.message === "No existe") {
        return { texto: "Error: El ID de usuario especificado no existe en el sistema.", color: "red", fondo: "#fdedec" };
    } else if (error.message === "ErrorServidor") {
        // "ErrorServidor" -> fallo de red/conexión.
        return { texto: "Error de Red: No se pudo conectar con el servidor. Verifique su json-server.", color: "red", fondo: "#fdedec" };
    } else {
        // Cualquier otro error -> mensaje genérico.
        return { texto: "Ocurrió un error inesperado con el servidor.", color: "red", fondo: "#fdedec" };
    }
}
