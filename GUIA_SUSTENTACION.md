# Guia de sustentacion - Administrador de tareas

Esta guia sirve para preparar una sustentacion individual de 60 minutos. No memorices cada palabra: entiende el flujo y usa el libreto como apoyo para explicar con seguridad.

## 1. Objetivo del proyecto

El sistema administra usuarios y tareas. Integra un frontend en JavaScript, una API REST con Node.js y Express, y una base de datos MySQL.

El sistema permite:

- Iniciar sesion con correo y contrasena.
- Gestionar usuarios con rol administrador.
- Crear, listar, editar y eliminar tareas.
- Cambiar el estado de una tarea desde la tabla o el tablero Kanban.
- Filtrar, ordenar y exportar tareas.
- Restringir acciones por rol.

## 2. Preparacion tecnica: 20 minutos

Realiza este proceso antes de la sustentacion. Practica hasta poder hacerlo sin ayuda.

1. Verifica que MySQL este encendido.
2. Abre una terminal en `C:\backend\Backend`.
3. Ejecuta `npm install` si cambiaste de equipo o no existe `node_modules`.
4. Verifica que `.env` tenga `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` y `CORS_ORIGIN`.
5. Confirma que `DB_USER` no sea `root`.
6. Para una base antigua, ejecuta una sola vez `npm run migrate`. En este equipo ya se aplico; no necesitas repetirlo salvo que restaures otra base anterior.
7. Crea o actualiza una cuenta administradora si es necesario:

```bash
npm run bootstrap:admin -- tu-correo@ejemplo.com "UnaClaveSegura123" "Tu nombre"
```

8. Inicia el backend:

```bash
npm start
```

9. Abre `http://localhost:3000` en el navegador.
10. Inicia sesion con la cuenta administradora.
11. Comprueba Usuarios, Tareas, Tablero, filtros, exportacion y cierre de sesion.

El backend sirve la build del frontend, por lo que no necesitas otra terminal para una demostracion normal. Si quieres desarrollar con recarga automatica, abre otra terminal en `C:\fronted\Frontend-` y ejecuta `npm run dev`; despues abre `http://localhost:5173`.

## 3. Datos profesionales para la demostracion

Antes de presentar, elimina o reemplaza tareas con textos como `Sed minus ducimus r`, `Ut libero dolore tem` o `tareas Editar`. Esos textos no cumplen el criterio de datos profesionales.

Crea estas tareas para practicar:

| Usuario | Tarea | Estado | Fecha logica |
| --- | --- | --- | --- |
| Ana Torres | Preparar informe semanal de actividades | Pendiente | Fecha actual |
| Carlos Gomez | Validar requisitos de la reunion de proyecto | En Proceso | Fecha actual |
| Laura Martinez | Consolidar evidencias de pruebas funcionales | Completada | Fecha actual |

No uses nombres genéricos como "Pepito Perez", fechas futuras sin motivo o descripciones incompletas.

## 4. Mapa de arquitectura

Memoriza este recorrido:

```text
Usuario
  -> evento del DOM
  -> src/index.js del frontend
  -> src/services/secureServices.js
  -> src/services/api.js
  -> ruta de Express
  -> controlador
  -> modelo
  -> pool de MySQL
  -> base de datos
  -> respuesta JSON
  -> interfaz actualizada
```

Responsabilidades de los archivos importantes:

| Archivo o carpeta | Responsabilidad |
| --- | --- |
| `C:\backend\Backend\server.js` | Punto de entrada: carga entorno, valida configuracion, prueba MySQL e inicia el servidor. |
| `C:\backend\Backend\src\app.js` | Configura Express, Helmet, CORS, limite de solicitudes, JSON, rutas y archivos estaticos. |
| `src/routes/` | Define las URL y metodos HTTP. |
| `src/controllers/` | Recibe solicitudes, valida datos, aplica permisos y crea respuestas HTTP. |
| `src/models/` | Ejecuta consultas parametrizadas a MySQL. |
| `src/db/connection.js` | Crea el pool de conexiones MySQL. |
| `src/middleware/auth.js` | Verifica JWT y autoriza roles. |
| `src/validators.js` | Centraliza reglas con Zod. |
| `C:\fronted\Frontend-\Modulos\src\index.js` | Controla estado, vistas, eventos DOM, filtros, modales y renderizado seguro. |
| `src/services/api.js` | Cliente HTTP; agrega el token JWT a cada solicitud protegida. |
| `src/services/secureServices.js` | Expone operaciones de autenticacion, usuarios y tareas. |

## 5. Libreto hablado: apertura

Di algo parecido a esto:

> “Buenos dias. Voy a presentar un administrador de tareas desarrollado con JavaScript en el frontend, Node.js y Express en el backend, y MySQL como base de datos. El proyecto implementa arquitectura por capas, autenticacion con JWT, roles, operaciones CRUD, validaciones, filtros, tablero Kanban y manejo de errores.”

> “La solucion esta separada en frontend, backend y base de datos. Esto permite que cada capa tenga una responsabilidad clara y facilita el mantenimiento del sistema.”

## 6. Libreto hablado: punto de entrada y backend

Abre `C:\backend\Backend\server.js`.

Di:

> “Este archivo es el punto de entrada. Primero carga las variables de entorno para no dejar credenciales en el codigo. Luego valida que la configuracion exista, verifica la conexion con MySQL y solo despues inicia el servidor.”

Abre `src/app.js`.

Di:

> “Aqui configuro la aplicacion Express. Uso Helmet para cabeceras defensivas, CORS para restringir los origenes permitidos, rate limit para limitar solicitudes repetitivas y limites de tamano para las solicitudes JSON.”

> “Despues conecto las rutas de autenticacion, usuarios y tareas. Las rutas de usuarios requieren administrador; las tareas requieren una sesion valida.”

## 7. Libreto hablado: conexion a MySQL

Abre `src/db/connection.js` y `src/config.js`.

Di:

> “La conexion se crea con un pool de MySQL. El pool reutiliza conexiones y evita abrir una conexion nueva en cada solicitud.”

> “Los datos de conexion vienen de `.env`. La aplicacion rechaza iniciar si faltan variables requeridas o si se intenta usar el usuario root. Asi se cumple el requisito de usar un usuario especifico autorizado.”

> “Las consultas usan parametros representados con signos de interrogacion. Esto evita que los datos recibidos se interpreten como instrucciones SQL.”

## 8. Libreto hablado: rutas, controladores y modelos

Abre una ruta de tareas, luego `tarea.controller.js` y finalmente `tarea.model.js`.

Di:

> “La ruta define el metodo HTTP. Por ejemplo, `POST /api/tareas` crea una tarea y `PATCH /api/tareas/:id` actualiza una tarea.”

> “El controlador no escribe SQL. Su responsabilidad es validar datos, verificar permisos y decidir la respuesta HTTP.”

> “El modelo concentra el acceso a MySQL. Esto separa la logica HTTP de la persistencia.”

> “La respuesta tiene una estructura consistente: `success`, `message`, `data` y `errors`. Esto facilita que el frontend sepa como interpretar resultados y errores.”

## 9. Libreto hablado: autenticacion y roles

Abre `src/controllers/auth.controller.js` y `src/middleware/auth.js`.

Di:

> “La autenticacion responde quien es el usuario. Al iniciar sesion, el backend busca el correo y compara la contrasena contra el hash guardado con bcrypt.”

> “Si las credenciales son correctas, el backend genera un JWT con el identificador y el rol. El frontend lo envia en la cabecera Authorization para cada solicitud protegida.”

> “La autorizacion responde que puede hacer el usuario. Un administrador gestiona usuarios y todas las tareas. Un usuario normal solo puede consultar y modificar sus propias tareas.”

> “No basta con ocultar botones en el frontend. El backend vuelve a verificar el token y el rol, porque una persona podria intentar llamar directamente una URL de la API.”

## 10. Libreto hablado: frontend y eventos DOM

Abre `C:\fronted\Frontend-\Modulos\src\index.js`.

Di:

> “Este archivo controla la interfaz. Mantiene el estado de la sesion, usuarios y tareas. Despues de cada operacion se actualiza la informacion para que tabla, filtros, exportacion y Kanban muestren datos coherentes.”

Eventos que debes nombrar y explicar:

| Evento | Dónde se usa | Explicacion corta |
| --- | --- | --- |
| `submit` | Login y formularios | Captura el envio, evita recarga y llama la API. |
| `click` | Pestanas, editar, eliminar, exportar y cierre de sesion | Ejecuta una accion cuando el usuario pulsa un control. |
| `input` | Busqueda | Filtra mientras el usuario escribe. |
| `change` | Estado, filtros y orden | Actualiza resultados cuando cambia una seleccion. |
| `dragstart` | Tarjeta Kanban | Guarda cual tarea empieza a arrastrarse. |
| `dragover` | Columna Kanban | Permite soltar una tarjeta en la columna. |
| `drop` | Columna Kanban | Actualiza el estado de la tarea en la API. |
| `keydown` | Modal dinamico | Permite cerrar el modal con Escape. |

Di:

> “Para prevenir XSS, los datos recibidos de la API se renderizan con `textContent`, no mediante HTML interpolado. Por eso una descripcion se muestra como texto y no se ejecuta como codigo.”

## 11. Demostracion funcional guiada

Sigue este orden durante la sustentacion.

1. Inicia sesion como administrador.
2. Señala el nombre y rol visible en el encabezado.
3. Abre Usuarios.
4. Crea un usuario con datos profesionales y rol `usuario`.
5. Edita el telefono del usuario mediante el modal dinamico.
6. Abre Tareas.
7. Asigna una tarea profesional al usuario creado.
8. Edita la descripcion con el modal dinamico.
9. Cambia el estado desde la lista desplegable.
10. Abre Tablero.
11. Arrastra una tarea a otra columna.
12. Regresa a Tareas y comprueba que el estado cambio.
13. Busca parte de una descripcion.
14. Filtra por usuario y estado.
15. Aplica fechas y cambia el orden.
16. Pulsa Exportar tareas visibles.
17. Pulsa Limpiar filtros.
18. Elimina una tarea mediante el modal.
19. Elimina el usuario y explica que se eliminan sus tareas asociadas.
20. Cierra sesion.

Frase para los modales:

> “Evite usar cuadros nativos del navegador. Las confirmaciones y ediciones se realizan en modales dinamicos, con validacion visual, cierre por Escape y botones bloqueados durante la solicitud para prevenir duplicados.”

## 12. Validaciones y manejo de errores

Di:

> “Valido en frontend para orientar al usuario, pero tambien valido en backend porque el cliente puede ser manipulado. Zod verifica identificadores positivos, correos validos, longitudes, estados permitidos y campos actualizables.”

> “Cuando ocurre un error, la API responde un codigo HTTP apropiado y el frontend muestra una notificacion dinamica durante seis segundos.”

Codigos que debes reconocer:

| Codigo | Significado |
| --- | --- |
| `200` | Operacion exitosa. |
| `201` | Recurso creado. |
| `401` | No hay sesion valida. |
| `403` | Hay sesion, pero no tiene permisos. |
| `404` | Recurso o ruta no encontrado. |
| `409` | Conflicto, por ejemplo correo duplicado. |
| `422` | Datos invalidos. |
| `500` | Error interno no esperado. |

## 13. Filtros y exportacion

Di:

> “La tabla permite buscar por texto en el usuario o descripcion. Tambien puedo filtrar por estado, usuario y rango de fechas.”

> “El resultado puede ordenarse por fecha, usuario, descripcion o estado, en orden ascendente o descendente.”

> “La exportacion usa exactamente las tareas visibles despues de aplicar filtros y orden. De esa forma el archivo coincide con la informacion que el usuario esta revisando.”

## 14. Preguntas probables y respuestas

| Pregunta | Respuesta sugerida |
| --- | --- |
| ¿Que es CRUD? | Crear, leer, actualizar y eliminar datos. |
| ¿Por que usar capas? | Separo responsabilidades para facilitar mantenimiento, pruebas y cambios. |
| ¿Por que no usar root? | Root tiene privilegios administrativos. La aplicacion debe usar una cuenta limitada para reducir impacto si una credencial se compromete. |
| ¿Que hace bcrypt? | Convierte contrasenas en hashes con salt; no se guardan contrasenas legibles. |
| ¿Que hace JWT? | Es un token firmado que representa una sesion y permite verificar usuario y rol. |
| ¿Diferencia entre autenticacion y autorizacion? | Autenticacion identifica al usuario; autorizacion define sus permisos. |
| ¿Como previenes SQL injection? | Uso consultas parametrizadas y no concateno datos del usuario dentro del SQL. |
| ¿Como previenes XSS? | Renderizo datos externos con `textContent` y no con HTML interpolado. |
| ¿Que hace una clave foranea? | Mantiene la relacion entre tablas y evita referencias invalidas. |
| ¿Que ocurre al borrar un usuario? | Se ejecuta una eliminacion controlada y sus tareas se eliminan por la relacion en cascada. |
| ¿Por que validas tambien en backend? | Porque las validaciones del navegador se pueden evadir. El servidor debe proteger los datos. |
| ¿Que hace el rate limit? | Limita solicitudes repetidas para reducir abuso y ataques de fuerza bruta. |

## 15. Simulacro de 60 minutos

| Tiempo | Actividad |
| --- | --- |
| 0 a 3 min | Presentacion y objetivo del sistema. |
| 3 a 10 min | Arquitectura y flujo de capas. |
| 10 a 15 min | Base de datos, pool y usuario MySQL. |
| 15 a 23 min | Login, bcrypt, JWT y roles. |
| 23 a 38 min | CRUD completo de usuarios y tareas. |
| 38 a 46 min | Kanban, filtros, orden y exportacion. |
| 46 a 52 min | Eventos DOM, modales y XSS. |
| 52 a 57 min | Validaciones, errores y seguridad. |
| 57 a 60 min | Resumen y preguntas. |

## 16. Checklist final

Antes de presentar confirma cada punto.

- El servidor inicia y muestra conexion MySQL exitosa.
- La aplicacion abre en `http://localhost:3000`.
- Existe una cuenta administradora que puedes usar.
- Existe una cuenta normal para demostrar restricciones de rol.
- Los datos de tareas son profesionales y las fechas son logicas.
- Puedes crear, listar, editar y eliminar usuarios.
- Puedes crear, listar, editar y eliminar tareas.
- Puedes explicar los eventos DOM sin leer esta guia.
- Puedes explicar `server.js`, rutas, controladores, modelos y conexion MySQL.
- Puedes mostrar filtros, orden, exportacion y Kanban.
- Puedes explicar bcrypt, JWT, Zod, SQL parametrizado, Helmet y rate limit.
- Practicaste al menos dos veces con cronometro.

## 17. Cierre de la sustentacion

Di:

> “El proyecto integra frontend, backend y MySQL mediante una arquitectura por capas. Implementa autenticacion, autorizacion por roles, CRUD validado, consultas parametrizadas, filtros, Kanban y manejo de errores. Cada accion se puede seguir desde el evento DOM hasta la persistencia en la base de datos.”
