import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createLoader } from "./test-loader.mjs";

function hookHarness(store) {
  const values = [],
    refs = [];
  let index = 0,
    refIndex = 0;
  const react = {
    ...React,
    useState(initial) {
      const i = index++;
      if (!(i in values))
        values[i] = typeof initial === "function" ? initial() : initial;
      return [
        values[i],
        (v) => {
          values[i] = typeof v === "function" ? v(values[i]) : v;
        },
      ];
    },
    useRef(initial) {
      const i = refIndex++;
      refs[i] ??= { current: initial };
      return refs[i];
    },
    useContext() {
      return store;
    },
  };
  return {
    react,
    render(component, props = {}) {
      index = 0;
      refIndex = 0;
      return component(props);
    },
  };
}
function find(node, predicate, result = []) {
  if (!node || typeof node !== "object") return result;
  if (predicate(node)) result.push(node);
  React.Children.forEach(node.props?.children, (child) =>
    find(child, predicate, result),
  );
  return result;
}

test("las cinco secciones se renderizan con React/Radix y mantienen los datos originales", () => {
  let active = "overview";
  const load = createLoader({
    transform(id, exports) {
      if (id !== "@/components/ui/tabs") return exports;
      return {
        ...exports,
        Tabs: (props) =>
          React.createElement(exports.Tabs, { ...props, defaultValue: active }),
      };
    },
  });
  const Page = load("src/app/dashboard/page.tsx").default;
  for (const [tab, texts] of Object.entries({
    overview: [
      "Estado del trabajo",
      "Total de proyectos",
      "Integrantes del equipo",
    ],
    projects: ["E-commerce Platform", "Marketing Website", "Ver detalles"],
    team: ["María García", "Carlos Ruiz", "Nuevo integrante"],
    tasks: [
      "Implementar autenticación",
      "Nueva tarea",
      "Documentar API endpoints",
      "Paginación de tareas",
    ],
    settings: [
      "Configuración del espacio",
      "Notificaciones",
      "Tareas por página",
    ],
  })) {
    active = tab;
    const html = renderToStaticMarkup(React.createElement(Page));
    for (const text of texts) assert.ok(html.includes(text), `${tab}: ${text}`);
    for (const section of [
      "Resumen",
      "Proyectos",
      "Equipo",
      "Tareas",
      "Configuración",
    ])
      assert.ok(html.includes(section));
    assert.ok(html.includes('role="tablist"'));
    assert.ok(html.includes("Nexo"));
  }
});

test("el proveedor bloquea doble envío y libera la carga incluso cuando hay validación inválida", async () => {
  const h = hookHarness();
  const load = createLoader({ overrides: { react: h.react } });
  const Provider = load(
    "src/components/dashboard/DashboardProvider.tsx",
  ).DashboardProvider;
  const getStore = () => h.render(Provider, { children: null }).props.value;
  const original = getStore();
  const project = {
    id: "p-new",
    name: "Proyecto de prueba",
    description: "Descripción",
    category: "web",
    priority: "Media",
    status: "Planificado",
    progress: 0,
    memberIds: [],
  };
  const first = original.run({ type: "project/create", project }, "Creado");
  assert.equal(getStore().busy, true);
  const second = await original.run(
    { type: "project/create", project },
    "Duplicado",
  );
  assert.match(second, /operación en curso/);
  assert.equal(await first, undefined);
  assert.equal(getStore().state.projects.length, 7);
  assert.equal(getStore().busy, false);
  const invalid = await getStore().run(
    { type: "project/delete", id: "p1" },
    "No debe eliminarse",
  );
  assert.match(invalid, /tareas asociadas/);
  assert.equal(getStore().busy, false);
  assert.equal(getStore().state.projects.length, 7);
});

test("Cancelar en confirmación de borrado no ejecuta una operación", () => {
  let calls = 0;
  const store = {
    busy: false,
    run: async () => {
      calls++;
    },
  };
  const h = hookHarness(store);
  const load = createLoader({ overrides: { react: h.react } });
  const Confirm = load(
    "src/components/dashboard/ConfirmDelete.tsx",
  ).ConfirmDelete;
  const props = {
    name: "Proyecto de prueba",
    action: { type: "project/delete", id: "p1" },
    consequence: "No afecta otras entidades.",
  };
  let tree = h.render(Confirm, props);
  tree.props.onOpenChange(true);
  tree = h.render(Confirm, props);
  find(tree, (n) => n.props?.children === "Cancelar")[0].props.onClick();
  assert.equal(h.render(Confirm, props).props.open, false);
  assert.equal(calls, 0);
});

test("ProjectForm valida campos, guarda miembros y limpia después del éxito", async () => {
  const base = createLoader();
  const state = base("src/lib/dashboard/initial-data.ts").initialState();
  const actions = [];
  const store = {
    state,
    busy: false,
    run: async (a) => {
      actions.push(a);
    },
  };
  const h = hookHarness(store);
  const load = createLoader({ overrides: { react: h.react } });
  const Form = load("src/components/ProjectForm.tsx").ProjectForm;
  let tree = h.render(Form);
  tree.props.onOpenChange(true);
  tree = h.render(Form);
  await find(tree, (n) => n.type === "form")[0].props.onSubmit({
    preventDefault() {},
  });
  tree = h.render(Form);
  assert.equal(actions.length, 0);
  assert.ok(find(tree, (n) => n.type?.name === "FormError")[0].props.error);
  for (const [id, value] of [
    ["project-name", "Nuevo proyecto UI"],
    ["project-description", "Descripción del proyecto"],
  ]) {
    find(tree, (n) => n.props?.id === id)[0].props.onChange({
      target: { value },
    });
    tree = h.render(Form);
  }
  for (const [id, value] of [
    ["project-category", "web"],
    ["project-priority", "Alta"],
  ]) {
    find(tree, (n) => n.props?.id === id)[0].props.onChange(value);
    tree = h.render(Form);
  }
  find(tree, (n) => n.type?.name === "Checkbox")[0].props.onCheckedChange(true);
  tree = h.render(Form);
  await find(tree, (n) => n.type === "form")[0].props.onSubmit({
    preventDefault() {},
  });
  tree = h.render(Form);
  assert.equal(actions.length, 1);
  assert.equal(actions[0].project.memberIds[0], "u1");
  assert.equal(tree.props.open, false);
  assert.equal(
    find(tree, (n) => n.props?.id === "project-name")[0].props.value,
    "",
  );
});

test("Spinner, Alert, Calendar y controles de paginación generan marcado accesible", () => {
  const load = createLoader();
  const { SaveButton, FormError, DateField } = load(
    "src/components/dashboard/FormControls.tsx",
  );
  const save = renderToStaticMarkup(
    React.createElement(SaveButton, { busy: true }),
  );
  assert.ok(save.includes("disabled"));
  assert.ok(save.includes("Procesando"));
  assert.ok(
    renderToStaticMarkup(
      React.createElement(FormError, { error: "Campos incompletos" }),
    ).includes('role="alert"'),
  );
  const calendar = renderToStaticMarkup(
    React.createElement(DateField, {
      id: "fecha",
      label: "Fecha límite",
      value: "2026-11-05",
      onChange() {},
    }),
  );
  assert.ok(calendar.includes("<summary"));
  assert.ok(calendar.includes("noviembre"));
});

test("editar integrante precarga datos, Calendar y Switch conservan el identificador", async () => {
  const base = createLoader();
  const state = base("src/lib/dashboard/initial-data.ts").initialState();
  const actions = [];
  const store = {
    state,
    busy: false,
    run: async (action) => {
      actions.push(action);
    },
  };
  const h = hookHarness(store);
  const load = createLoader({ overrides: { react: h.react } });
  const Form = load("src/components/dashboard/MemberForm.tsx").MemberForm;
  const props = { member: state.members[0] };
  let tree = h.render(Form, props);
  tree.props.onOpenChange(true);
  tree = h.render(Form, props);
  assert.equal(
    find(tree, (n) => n.props?.id === "member-u1-name")[0].props.value,
    "María García",
  );
  find(tree, (n) => n.props?.id === "member-u1-phone")[0].props.onChange({
    target: { value: "999123456" },
  });
  tree = h.render(Form, props);
  find(tree, (n) => n.type?.name === "DateField")[0].props.onChange(
    "2000-01-15",
  );
  tree = h.render(Form, props);
  find(
    tree,
    (n) => n.props?.id === "member-u1-active",
  )[0].props.onCheckedChange(false);
  tree = h.render(Form, props);
  await find(tree, (n) => n.type === "form")[0].props.onSubmit({
    preventDefault() {},
  });
  assert.equal(actions.length, 1);
  assert.equal(actions[0].member.userId, "u1");
  assert.equal(actions[0].member.isActive, false);
  assert.equal(actions[0].member.birthdate, "2000-01-15");
  assert.equal(h.render(Form, props).props.open, false);
});

test("editar tarea limita responsables y reinicia la selección al cambiar de proyecto", async () => {
  const base = createLoader();
  const state = base("src/lib/dashboard/initial-data.ts").initialState();
  const actions = [];
  const store = {
    state,
    busy: false,
    run: async (action) => {
      actions.push(action);
    },
  };
  const h = hookHarness(store);
  const load = createLoader({ overrides: { react: h.react } });
  const Form = load("src/components/dashboard/TaskForm.tsx").TaskForm;
  const props = { task: state.tasks[0] };
  let tree = h.render(Form, props);
  tree.props.onOpenChange(true);
  tree = h.render(Form, props);
  let choice = find(tree, (n) => n.props?.id === "task-t1-user")[0];
  assert.equal(choice.props.options.length, 2);
  find(tree, (n) => n.props?.id === "task-t1-project")[0].props.onChange("p4");
  tree = h.render(Form, props);
  choice = find(tree, (n) => n.props?.id === "task-t1-user")[0];
  assert.equal(choice.props.value, "");
  assert.ok(choice.props.options.every((o) => ["u4", "u5"].includes(o.value)));
  choice.props.onChange("u4");
  tree = h.render(Form, props);
  find(tree, (n) => n.type?.name === "DateField")[0].props.onChange(
    "2026-12-01",
  );
  tree = h.render(Form, props);
  await find(tree, (n) => n.type === "form")[0].props.onSubmit({
    preventDefault() {},
  });
  assert.equal(actions.length, 1);
  assert.equal(actions[0].task.id, "t1");
  assert.equal(actions[0].task.projectId, "p4");
  assert.equal(actions[0].task.userId, "u4");
  assert.equal(actions[0].task.deadline, "2026-12-01");
});

test("controles de paginación cambian registros y se ajustan tras eliminar la última página", () => {
  const base = createLoader();
  const state = base("src/lib/dashboard/initial-data.ts").initialState();
  state.settings.pageSize = 3;
  const store = { state, busy: false, run: async () => {} };
  const h = hookHarness(store);
  const load = createLoader({ overrides: { react: h.react } });
  const Table = load("src/components/TaskTable.tsx").TasksTable;
  let tree = h.render(Table);
  const rows = () =>
    find(tree, (n) => n.type?.name === "TaskForm" && n.props.task);
  assert.equal(rows().length, 3);
  assert.equal(rows()[0].props.task.id, "t1");
  find(tree, (n) => n.type?.name === "PaginationNext")[0].props.onClick({
    preventDefault() {},
  });
  tree = h.render(Table);
  assert.equal(rows().length, 2);
  assert.equal(rows()[0].props.task.id, "t4");
  state.tasks = state.tasks.slice(0, 3);
  tree = h.render(Table);
  assert.equal(rows().length, 3);
  assert.equal(rows()[0].props.task.id, "t1");
  assert.equal(
    find(tree, (n) => n.type?.name === "PaginationNext")[0].props[
      "aria-disabled"
    ],
    true,
  );
});
