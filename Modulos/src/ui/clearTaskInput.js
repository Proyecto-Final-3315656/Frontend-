// ============================================================
// src/ui/clearTaskInput.js
// Limpia el campo de texto donde se escribe la descripción de
// la tarea después de registrarla.
// ============================================================
const inputTareaDesc = document.getElementById('userMessage');

// --- Vacía el input de descripción de la tarea ---
export function clearTaskInput() {
    if (inputTareaDesc) {
        inputTareaDesc.value = '';
    }
}
