import { authService, tasksService, usersService } from "./services/secureServices";

const state = { user: null, tasks: [], users: [], draggedTaskId: null };
const $ = (id) => document.getElementById(id);
let noticeTimer;
let activeModal;

function notice(message, type = "info") {
  const element = $("notice");
  clearTimeout(noticeTimer);
  element.textContent = message;
  element.dataset.type = type;
  element.style.display = "block";
  noticeTimer = setTimeout(clearNotice, 6000);
}

function clearNotice() {
  clearTimeout(noticeTimer);
  const element = $("notice");
  element.textContent = "";
  element.style.display = "none";
  delete element.dataset.type;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(label, action, className) {
  const node = element("button", label, className);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function openModal({ title, description, fields = [], confirmText, destructive = false, onConfirm }) {
  activeModal?.close();
  const previousFocus = document.activeElement;
  const overlay = element("div", undefined, "modal-overlay modal-activo");
  const dialog = element("section", undefined, "modal");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "modalTitle");
  const header = element("div", undefined, "modal-header");
  const heading = element("h2", title, "modal-titulo");
  heading.id = "modalTitle";
  const closeButton = button("Cerrar", close, "modal-cerrar");
  closeButton.setAttribute("aria-label", "Cerrar ventana");
  header.append(heading, closeButton);
  const form = element("form", undefined, "modal-body");
  form.noValidate = true;
  if (description) form.append(element("p", description, "modal-mensaje"));
  const inputs = new Map();
  fields.forEach((field) => {
    const group = element("div", undefined, "form-group");
    const label = element("label", field.label);
    label.htmlFor = `modal-${field.name}`;
    const input = document.createElement(field.multiline ? "textarea" : "input");
    input.id = `modal-${field.name}`;
    input.name = field.name;
    input.value = field.value || "";
    input.required = field.required !== false;
    input.maxLength = field.maxLength || 1000;
    if (!field.multiline) input.type = field.type || "text";
    if (field.multiline) input.rows = 4;
    group.append(label, input);
    form.append(group);
    inputs.set(field.name, input);
  });
  const error = element("p", undefined, "modal-error");
  error.setAttribute("role", "alert");
  form.append(error);
  const actions = element("div", undefined, "modal-botones");
  const cancelButton = button("Cancelar", close, "btn-modal-secondary");
  const confirmButton = button(confirmText, async () => {
    const values = Object.fromEntries([...inputs].map(([name, input]) => [name, input.value.trim()]));
    if ([...inputs.values()].some((input) => input.required && !input.value.trim())) {
      error.textContent = "Complete los campos obligatorios.";
      return;
    }
    confirmButton.disabled = true;
    cancelButton.disabled = true;
    confirmButton.textContent = "Procesando...";
    error.textContent = "";
    try {
      await onConfirm(values);
      close();
    } catch (requestError) {
      error.textContent = requestError.message || "No se pudo completar la operación.";
      confirmButton.disabled = false;
      cancelButton.disabled = false;
      confirmButton.textContent = confirmText;
    }
  }, destructive ? "btn-modal-primary danger" : "btn-modal-primary");
  actions.append(cancelButton, confirmButton);
  dialog.append(header, form, actions);
  overlay.append(dialog);
  document.body.append(overlay);

  function onKeyDown(event) {
    if (event.key === "Escape") close();
  }
  function close() {
    document.removeEventListener("keydown", onKeyDown);
    overlay.remove();
    activeModal = null;
    previousFocus?.focus();
  }
  overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
  document.addEventListener("keydown", onKeyDown);
  activeModal = { close };
  setTimeout(() => (inputs.values().next().value || confirmButton).focus(), 0);
}

function visibleTasks() {
  const status = $("statusFilter").value;
  const userId = $("userFilter").value;
  const query = $("searchFilter").value.trim().toLocaleLowerCase("es");
  const from = $("fromDate").value;
  const to = $("toDate").value;
  const sortBy = $("sortBy").value;
  const direction = $("sortDirection").value === "asc" ? 1 : -1;
  const stateOrder = { Pendiente: 1, "En Proceso": 2, Completada: 3 };

  return state.tasks
    .filter((task) => {
      const createdDate = String(task.createdAt || "").slice(0, 10);
      const matchesQuery = !query || `${task.nombreUsuario} ${task.descripcion}`.toLocaleLowerCase("es").includes(query);
      return (!status || task.estado === status)
        && (!userId || String(task.idUsuario) === userId)
        && matchesQuery
        && (!from || createdDate >= from)
        && (!to || createdDate <= to);
    })
    .sort((first, second) => {
      if (sortBy === "createdAt") return (new Date(first.createdAt) - new Date(second.createdAt)) * direction;
      if (sortBy === "estado") return ((stateOrder[first.estado] || 0) - (stateOrder[second.estado] || 0)) * direction;
      return String(first[sortBy] || "").localeCompare(String(second[sortBy] || ""), "es") * direction;
    });
}

function renderTasks() {
  const body = $("tasksBody");
  body.replaceChildren();
  const tasks = visibleTasks();
  $("taskCount").textContent = `${tasks.length} tareas visibles`;
  if (!tasks.length) {
    const row = element("tr");
    const cell = element("td", "No hay tareas para mostrar.");
    cell.colSpan = 4;
    row.append(cell);
    body.append(row);
    return;
  }
  tasks.forEach((task) => {
    const row = element("tr");
    row.append(element("td", task.nombreUsuario));
    row.append(element("td", task.descripcion, "descripcion-celda"));
    const statusCell = element("td");
    const select = element("select");
    ["Pendiente", "En Proceso", "Completada"].forEach((status) => {
      const option = element("option", status);
      option.value = status;
      option.selected = status === task.estado;
      select.append(option);
    });
    select.setAttribute("aria-label", `Estado de la tarea ${task.descripcion}`);
    select.addEventListener("change", () => updateTask(task.id, { estado: select.value }));
    statusCell.append(select);
    const actions = element("td");
    actions.append(button("Editar", () => editTask(task), "btn-editar"), button("Eliminar", () => removeTask(task), "btn-eliminar"));
    row.append(statusCell, actions);
    body.append(row);
  });
}

function renderUsers() {
  const body = $("usersBody");
  body.replaceChildren();
  state.users.forEach((user) => {
    const row = element("tr");
    row.append(element("td", user.nombre), element("td", user.email), element("td", user.rol));
    const actions = element("td");
    actions.append(button("Editar", () => editUser(user), "btn-editar"));
    if (user.id !== state.user.id) actions.append(button("Eliminar", () => removeUser(user), "btn-eliminar"));
    row.append(actions);
    body.append(row);
  });
  const select = $("taskUser");
  const userFilter = $("userFilter");
  const previousFilter = userFilter.value;
  select.replaceChildren();
  userFilter.replaceChildren(element("option", "Todos los usuarios"));
  userFilter.firstElementChild.value = "";
  state.users.forEach((user) => {
    const option = element("option", `${user.nombre} (${user.email})`);
    option.value = user.id;
    select.append(option);
    const filterOption = element("option", user.nombre);
    filterOption.value = user.id;
    userFilter.append(filterOption);
  });
  userFilter.value = previousFilter;
}

function renderBoard() {
  const board = $("board");
  board.replaceChildren();
  ["Pendiente", "En Proceso", "Completada"].forEach((status) => {
    const column = element("section", undefined, "kanban-columna");
    column.append(element("h3", status, "kanban-titulo"));
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", () => {
      if (state.draggedTaskId) updateTask(state.draggedTaskId, { estado: status });
    });
    state.tasks.filter((task) => task.estado === status).forEach((task) => {
      const card = element("article", undefined, "kanban-tarjeta");
      card.draggable = true;
      card.append(element("strong", task.nombreUsuario), element("p", task.descripcion));
      card.addEventListener("dragstart", () => { state.draggedTaskId = task.id; });
      card.addEventListener("dragend", () => { state.draggedTaskId = null; });
      column.append(card);
    });
    board.append(column);
  });
}

async function refresh() {
  state.tasks = await tasksService.list();
  if (state.user.rol === "admin") state.users = await usersService.list();
  renderTasks();
  renderBoard();
  if (state.user.rol === "admin") renderUsers();
}

async function updateTask(id, data) {
  try { await tasksService.update(id, data); await refresh(); notice("Tarea actualizada.", "success"); }
  catch (error) { notice(error.message, "error"); }
}

async function editTask(task) {
  openModal({
    title: "Editar tarea",
    fields: [{ name: "descripcion", label: "Descripción", value: task.descripcion, multiline: true }],
    confirmText: "Guardar cambios",
    onConfirm: async ({ descripcion }) => {
      await tasksService.update(task.id, { descripcion });
      await refresh();
      notice("Tarea actualizada.", "success");
    },
  });
}

async function removeTask(task) {
  openModal({
    title: "Eliminar tarea",
    description: `Se eliminará la tarea: ${task.descripcion}`,
    confirmText: "Eliminar tarea",
    destructive: true,
    onConfirm: async () => {
      await tasksService.remove(task.id);
      await refresh();
      notice("Tarea eliminada.", "success");
    },
  });
}

async function editUser(user) {
  openModal({
    title: "Editar usuario",
    fields: [
      { name: "nombre", label: "Nombre", value: user.nombre, maxLength: 100 },
      { name: "telefono", label: "Teléfono", value: user.telefono, maxLength: 50, required: false },
    ],
    confirmText: "Guardar cambios",
    onConfirm: async ({ nombre, telefono }) => {
      await usersService.update(user.id, { nombre, telefono });
      await refresh();
      notice("Usuario actualizado.", "success");
    },
  });
}

async function removeUser(user) {
  openModal({
    title: "Eliminar usuario",
    description: `Se eliminará a ${user.nombre} y todas sus tareas asociadas. Esta acción no se puede deshacer.`,
    confirmText: "Eliminar usuario",
    destructive: true,
    onConfirm: async () => {
      await usersService.remove(user.id);
      await refresh();
      notice("Usuario y tareas eliminados.", "success");
    },
  });
}

function showView(viewId) {
  ["tasksView", "usersView", "boardView"].forEach((id) => {
    const active = id === viewId;
    $(id).hidden = !active;
    $(id).classList.toggle("activo", active);
  });
  document.querySelectorAll("[role='tab']").forEach((tab) => {
    const active = tab.dataset.view === viewId;
    tab.classList.toggle("activo", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function exportTasks() {
  const blob = new Blob([JSON.stringify(visibleTasks(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tareas.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function startSession(user) {
  state.user = user;
  $("loginView").hidden = true;
  $("appView").hidden = false;
  $("sessionInfo").textContent = `${user.nombre} | ${user.rol}`;
  clearNotice();
  const admin = user.rol === "admin";
  $("usersTab").hidden = !admin;
  $("assigneeGroup").hidden = !admin;
  await refresh();
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = event.submitter;
  submit.disabled = true;
  try { await startSession(await authService.login($("loginEmail").value, $("loginPassword").value)); }
  catch (error) { notice(error.message, "error"); }
  finally { submit.disabled = false; }
});

$("taskForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = event.submitter;
  submit.disabled = true;
  try {
    const data = { descripcion: $("taskDescription").value };
    if (state.user.rol === "admin") data.idUsuario = Number($("taskUser").value);
    await tasksService.create(data);
    event.target.reset();
    await refresh();
    notice("Tarea creada.", "success");
  } catch (error) { notice(error.message, "error"); }
  finally { submit.disabled = false; }
});

$("userForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = event.submitter;
  submit.disabled = true;
  try {
    await usersService.create({ nombre: $("userName").value, email: $("userEmail").value, telefono: $("userPhone").value, password: $("userPassword").value, rol: $("userRole").value });
    event.target.reset();
    await refresh();
    notice("Usuario creado.", "success");
  } catch (error) { notice(error.message, "error"); }
  finally { submit.disabled = false; }
});

document.querySelectorAll("[role='tab']").forEach((tab) => tab.addEventListener("click", () => showView(tab.dataset.view)));
["searchFilter", "statusFilter", "userFilter", "fromDate", "toDate", "sortBy", "sortDirection"].forEach((id) => {
  $(id).addEventListener(id === "searchFilter" ? "input" : "change", renderTasks);
});
$("clearFiltersButton").addEventListener("click", () => {
  $("searchFilter").value = "";
  $("statusFilter").value = "";
  $("userFilter").value = "";
  $("fromDate").value = "";
  $("toDate").value = "";
  $("sortBy").value = "createdAt";
  $("sortDirection").value = "desc";
  renderTasks();
  notice("Filtros restablecidos.", "info");
});
$("exportButton").addEventListener("click", exportTasks);
$("logoutButton").addEventListener("click", () => { authService.logout(); window.location.reload(); });

authService.me().then(startSession).catch(() => authService.logout());
