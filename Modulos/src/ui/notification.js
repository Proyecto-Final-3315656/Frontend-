// ============================================================
// src/ui/notification.js
// Sistema de notificaciones DINÁMICAS y atractivas.
// En lugar de un solo contenedor inline (como era antes), se crea
// un contenedor flotante en la esquina superior derecha y cada
// notificación es una tarjeta con animación de entrada/salida,
// auto-dismiss y tipos visuales (éxito/error/info/advertencia).
// ============================================================

// Referencia al contenedor de notificaciones (flotante).
// Se declara antes de crear el contenedor para evitar Temporal Dead Zone.
let contenedor;

// Creamos el contenedor flotante una sola vez (se reutiliza).
function Toast() {
    // Si ya existe, no lo volvemos a crear.
    if (document.getElementById('toast-container')) return;
    contenedor = document.createElement('div');
    contenedor.id = 'toast-container';
    // Posición fija: flota sobre el contenido, arriba a la derecha.
    contenedor.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        display: flex; flex-direction: column; gap: 12px; width: 340px;
    `;
    document.body.appendChild(contenedor);
}
// Inicializamos el contenedor al cargar el módulo.
Toast();

// Tipos de notificación y su paleta visual temática.
const TIPOS = {
    success: { fondo: 'linear-gradient(135deg,#16a34a,#22c55e)', icono: '✅', color: '#fff' },
    error:   { fondo: 'linear-gradient(135deg,#dc2626,#ef4444)', icono: '❌', color: '#fff' },
    info:    { fondo: 'linear-gradient(135deg,#2563eb,#3b82f6)', icono: 'ℹ️',  color: '#fff' },
    warning: { fondo: 'linear-gradient(135deg,#ea580b,#f97316)', icono: '⚠️',  color: '#fff' },
};

/** Lanza una notificación animada.
 *  ACCEPTA DOS FORMATOS (compatibles con código viejo y nuevo):
 *  - NUEVO:  lanzarNotificacion(texto, tipo, duracion)   tipo = success|error|info|warning
 *  - LEGADO: lanzarNotificacion(texto, colorHex, fondoHex) (ej: "red", "#fdedec")
 *  @param {string} texto  - Mensaje a mostrar.
 *  @param {string} tipoColor - Tipo (nuevo) o color (legado).
 *  @param {number|string} duracionOFondo - ms (nuevo) o fondo hex (legado).
 */
export function lanzarNotificacion(texto, tipoColor = 'info', duracionOFondo = 3500) {
    let tipo, fondo, colorHex;

    // Si el segundo arg. es un tipo conocido => formato NUEVO.
    if (TIPOS[tipoColor]) {
        tipo = tipoColor;
    } else {
        // Formato LEGADO: color (red/gris) + fondo.
        colorHex = tipoColor === 'red' ? '#ef4444' : (tipoColor === 'green' ? '#22c55e' : (tipoColor === 'gray' ? '#9ca3af' : '#2980b9'));
        fondo = duracionOFondo || '#fdedec';
        // Mapeamos a un tipo visual equivalente.
        tipo = tipoColor === 'red' ? 'error'
             : tipoColor === 'green' ? 'success'
             : tipoColor === 'gray' ? 'warning' : 'info';
    }

    const t = fondo ? { fondo, icono: TIPOS[tipo].icono, color: '#fff' } : TIPOS[tipo];
    const d = (typeof duracionOFondo === 'number') ? duracionOFondo : 3500;
    const tarjeta = document.createElement('div');

    // Estilos base con animación de entrada (desde la derecha).
    tarjeta.style.cssText = `
        min-height: 56px;
        background: ${t.fondo};
        color: ${t.color};
        padding: 14px 16px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.35);
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(120%);
        transition: all 0.35s cubic-bezier(.25,.8,.25,1);
        overflow: hidden;
    `;
    tarjeta.innerHTML = `
        <span style="font-size:18px;line-height:1;">${t.icono}</span>
        <span style="flex:1;">${texto}</span>
    `;

    contenedor.appendChild(tarjeta);

    // Fuerza el render y luego anima la entrada (fadeIn + translateX).
    requestAnimationFrame(() => {
        tarjeta.style.opacity = '1';
        tarjeta.style.transform = 'translateX(0)';
    });

    // Barra de progreso que avanza mientras dura el timeout.
    const barra = document.createElement('div');
    barra.style.cssText = `
        position: absolute; bottom: 0; left: 0; height: 3px;
        background: rgba(255,255,255,0.45); width: 100%;
        transform-origin: left; transition: transform ${d}ms linear;
    `;
    barra.style.transform = 'scaleX(1)';
    tarjeta.appendChild(barra);
    // Progreso inverso
    setTimeout(() => { barra.style.transform = 'scaleX(0)'; }, 50);

    // Al click del usuario, desaparece de inmediato.
    tarjeta.style.cursor = 'pointer';
    tarjeta.addEventListener('click', () => cerrarTarjeta(tarjeta));

    // Auto-dismiss al vencer la duración (ahora `d`).
    const timer = setTimeout(() => cerrarTarjeta(tarjeta), d);

    // Si se vuelve a llamar con el mismo "texto" antes de tiempo, se reinicia el timer.
    tarjeta._resetTimer = () => { clearTimeout(timer); };
}

// Cierra (animación de salida) una tarjeta de notificación.
function cerrarTarjeta(tarjeta) {
    if (!tarjeta || !tarjeta.parentNode) return;
    tarjeta.style.opacity = '0';
    tarjeta.style.transform = 'translateX(120%)';
    // La eliminamos del DOM al terminar la animación.
    tarjeta.addEventListener('transitionend', () => tarjeta.remove(), { once: true });
}

// Limpia (cierra con animación) todas las notificaciones visibles.
export function limpiarNotificacion() {
    if (!contenedor) return;
    const tarjetas = contenedor.querySelectorAll('div[style*="opacity"]');
    tarjetas.forEach(c => cerrarTarjeta(c));
}

// Expone también un alias 'show' por si se usa directamente.
export { lanzarNotificacion as show };
