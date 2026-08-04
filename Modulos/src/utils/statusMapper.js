// ============================================================
// src/utils/statusMapper.js
// Mapea el "estado" de una tarea a su config visual (color, texto de
// botón, estilo de texto) y define el ciclo de transición de estados.
// Estado: Pendiente -> En Proceso -> Completada -> (vuelve a Pendiente).
// ============================================================

// --- Devuelve la configuración visual para un estado ---
export function getStatusConfig(estado) {
    const configs = {
        "Pendiente": {
            colorEstado: "#e67e22",
            textoBotonEstado: "Iniciar",
            estiloDecoracionTexto: "none; color: black;",
            bgColorBoton: "#e67e22"
        },
        "En Proceso": {
            colorEstado: "#3498db",
            textoBotonEstado: "Completar",
            estiloDecoracionTexto: "none; color: black;",
            bgColorBoton: "#3498db"
        },
        "Completada": {
            colorEstado: "#27ae60",
            textoBotonEstado: "Reabrir",
            estiloDecoracionTexto: "line-through; color: gray;",
            bgColorBoton: "#7f8c8d"
        }
    };
    // Si el estado no es reconocido, cae en Pendiente por seguridad.
    return configs[estado] || configs["Pendiente"];
}

// --- Calcula el siguiente estado en el ciclo → Pendiente/En Proceso/Completada ---
export function getSiguienteEstado(estado) {
    const ciclo = ["Pendiente", "En Proceso", "Completada"];
    const idx = ciclo.indexOf(estado);
    return ciclo[(idx + 1) % ciclo.length]; // % length vuelve a Pendiente
}
