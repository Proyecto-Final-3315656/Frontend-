# Frontend - Administrador de tareas

Cliente Vite para la API ubicada en `C:\backend\Backend`. La interfaz usa eventos `submit`, `click`, `change`, `dragstart` y `drop` para ejecutar el CRUD y el tablero Kanban.

## Ejecución

```bash
npm install
npm run dev
```

Los comandos se delegan a `Modulos`, que es la aplicación ejecutable. También puede entrar a esa carpeta directamente.

## Configuración

Copie `Modulos/.env.example` como `Modulos/.env`.

```env
VITE_API_URL=/api
```

En desarrollo Vite redirige `/api` al backend en `http://localhost:3000`. En producción configure `VITE_API_URL` con la URL pública del backend o sirva el build desde el mismo origen.

## Roles

- Los usuarios autenticados administran únicamente sus tareas.
- Los administradores también crean, editan y eliminan usuarios, asignan tareas y consultan el tablero completo.

El token de sesión se mantiene en `sessionStorage` y se transmite en la cabecera `Authorization`. El backend es quien impone los permisos.

## Sustentacion

Consulta la [guia de sustentacion](GUIA_SUSTENTACION.md) para preparar el despliegue, el recorrido funcional, la explicacion de arquitectura y un libreto de practica de 60 minutos.

## Seguridad y calidad

- Los datos recibidos de API se renderizan con `textContent`; no se interpolan como HTML.
- Los formularios bloquean el botón durante la operación para evitar duplicados.
- Las vistas de tabla, filtro, exportación y Kanban usan el mismo estado en memoria y se actualizan después de cada mutación.
- Ejecute `npm run build` para verificar la build de producción.
