import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'
const nodeRequire = createRequire(import.meta.url)
const cache = new Map()
function load(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file)
  const loaded = { exports: {} }
  cache.set(file, loaded.exports)
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const localRequire = id => id.startsWith('.') ? load(path.resolve(path.dirname(file), id + '.ts')) : nodeRequire(id)
  vm.runInNewContext(source, { module: loaded, exports: loaded.exports, require: localRequire, structuredClone, Date, Set }, { filename: file })
  cache.set(file, loaded.exports)
  return loaded.exports
}
const { initialState } = load('src/lib/dashboard/initial-data.ts')
const { applyAction } = load('src/lib/dashboard/operations.ts')
const { metrics } = load('src/lib/dashboard/model.ts')
function project(overrides = {}) { return { id: 'new-project', name: 'Proyecto nuevo', description: 'Descripción', category: 'web', priority: 'Alta', status: 'Planificado', progress: 0, memberIds: ['u1'], ...overrides } }
test('datos iniciales y métricas se derivan de registros originales', () => {
  const m = metrics(initialState())
  assert.equal(m.projects, 6); assert.equal(m.members, 5); assert.equal(m.tasks, 5); assert.equal(m.completed, 1)
})
test('crear proyecto asigna miembros, evita duplicados y actualiza métricas sin mutar el original', () => {
  const before = initialState(); const result = applyAction(before, { type: 'project/create', project: project({ memberIds: ['u1', 'u1'] }) })
  assert.equal(result.error, undefined); assert.equal(result.state.projects.length, 7); assert.equal(before.projects.length, 6)
  assert.equal(result.state.projects.at(-1).memberIds.length, 1)
  assert.ok(applyAction(result.state, { type: 'project/create', project: project() }).error)
  assert.equal(metrics(result.state).projects, 7)
})
test('validación de proyecto rechaza campos vacíos, nombres repetidos y miembros inexistentes', () => {
  for (const changes of [{ name: '' }, { description: '' }, { name: 'E-commerce Platform' }, { memberIds: ['missing'] }]) {
    const before = initialState(); const result = applyAction(before, { type: 'project/create', project: project(changes) })
    assert.ok(result.error); assert.equal(result.state, before)
  }
})
test('eliminar proyecto con tareas se bloquea; eliminación válida libera referencias', () => {
  const before = initialState(); assert.ok(applyAction(before, { type: 'project/delete', id: 'p1' }).error)
  const created = applyAction(before, { type: 'project/create', project: project() }).state
  const after = applyAction(created, { type: 'project/delete', id: 'new-project' })
  assert.equal(after.error, undefined); assert.equal(after.state.projects.length, 6)
  assert.equal(before.projects.length, 6)
})
function member(overrides = {}) { return { userId: 'new-user', name: 'Integrante nuevo', email: 'nuevo@example.com', role: 'Developer', position: 'Frontend', birthdate: '2000-02-29', phone: '+51 999 123 456', projectId: 'p3', isActive: true, ...overrides } }
test('CRUD de integrantes conserva identificadores, relaciones y métricas', () => {
  const before = initialState(); const saved = applyAction(before, { type: 'member/save', member: member(), create: true })
  assert.equal(saved.error, undefined); assert.equal(saved.state.members.length, 6)
  assert.ok(saved.state.projects.find(p => p.id === 'p3').memberIds.includes('new-user'))
  const edited = applyAction(saved.state, { type: 'member/save', member: member({ name: 'Nombre editado', projectId: 'p5' }), create: false })
  assert.equal(edited.error, undefined); assert.equal(edited.state.members.at(-1).userId, 'new-user')
  assert.ok(!edited.state.projects.find(p => p.id === 'p3').memberIds.includes('new-user'))
  const inactive = applyAction(edited.state, { type: 'member/toggle', id: 'new-user', isActive: false }).state
  assert.equal(metrics(inactive).activeMembers, 4)
  const deleted = applyAction(inactive, { type: 'member/delete', id: 'new-user' })
  assert.equal(deleted.error, undefined); assert.equal(deleted.state.members.length, 5)
  assert.ok(deleted.state.projects.every(p => !p.memberIds.includes('new-user')))
})
test('integrantes rechazan correo duplicado, fechas imposibles, teléfono inválido y proyecto inexistente', () => {
  for (const changes of [{ email: 'maria@example.com' }, { email: 'incorrecto' }, { birthdate: '2025-02-30' }, { birthdate: '2100-01-01' }, { phone: 'abc' }, { projectId: 'missing' }]) {
    assert.ok(applyAction(initialState(), { type: 'member/save', member: member(changes), create: true }).error)
  }
})
test('no se elimina integrante con tareas; traslado principal conserva membresía necesaria', () => {
  const before = initialState(); assert.ok(applyAction(before, { type: 'member/delete', id: 'u1' }).error)
  const updated = applyAction(before, { type: 'member/save', member: member({ ...before.members[0], projectId: 'p3', birthdate: '2000-01-01', phone: '999123456' }), create: false })
  assert.equal(updated.error, undefined)
  assert.ok(updated.state.projects.find(p => p.id === 'p1').memberIds.includes('u1'))
  assert.ok(updated.state.projects.find(p => p.id === 'p3').memberIds.includes('u1'))
})
const { paginate } = load('src/lib/dashboard/model.ts')
function task(overrides = {}) { return { id: 'new-task', title: 'Nueva tarea', description: 'Descripción detallada', projectId: 'p1', status: 'Pendiente', priority: 'Alta', userId: 'u1', deadline: '2026-12-15', ...overrides } }
test('CRUD tareas conserva identificadores, actualiza métricas y libera restricciones', () => {
  const before = initialState(); const created = applyAction(before, { type: 'task/save', task: task(), create: true })
  assert.equal(created.error, undefined); assert.equal(metrics(created.state).tasks, 6)
  assert.equal(paginate(created.state.tasks, 2, 5).records.length, 1)
  const edited = applyAction(created.state, { type: 'task/save', task: task({ status: 'Completado' }), create: false })
  assert.equal(edited.error, undefined); assert.equal(metrics(edited.state).completed, 2)
  const deleted = applyAction(edited.state, { type: 'task/delete', id: 'new-task' })
  assert.equal(deleted.error, undefined); assert.equal(deleted.state.tasks.length, 5)
  assert.equal(paginate(deleted.state.tasks, 2, 5).page, 1)
})
test('tareas rechazan campos vacíos, fecha inválida y responsable ajeno al proyecto', () => {
  for (const changes of [{ title: '' }, { description: '' }, { deadline: '2026-02-30' }, { projectId: 'missing' }, { userId: 'u4' }, { userId: 'missing' }, { priority: 'Inventada' }]) {
    const before = initialState(); const result = applyAction(before, { type: 'task/save', task: task(changes), create: true })
    assert.ok(result.error); assert.equal(result.state, before)
  }
})
test('paginación limita los extremos, soporta vacío y cambio de tamaño', () => {
  const list = Array.from({ length: 13 }, (_, i) => i)
  assert.equal(paginate(list, 99, 5).page, 3); assert.equal(paginate(list, -1, 5).page, 1)
  assert.equal(paginate(list, 2, 10).records.length, 3)
  assert.equal(paginate([], 9, 5).records.length, 0); assert.equal(paginate([], 9, 5).page, 1)
  assert.equal(paginate(list, 1, 0).pageSize, 5)
})
test('reasignar tareas permite eliminar integrante sin referencias huérfanas', () => {
  const before = initialState(); const first = before.tasks[0]
  const reassigned = applyAction(before, { type: 'task/save', task: { ...first, userId: 'u2' }, create: false })
  assert.equal(reassigned.error, undefined)
  const deleted = applyAction(reassigned.state, { type: 'member/delete', id: 'u1' })
  assert.equal(deleted.error, undefined); assert.ok(deleted.state.tasks.every(t => t.userId !== 'u1'))
})
