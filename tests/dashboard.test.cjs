const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const cache = new Map()
function load(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file)
  const module = { exports: {} }
  cache.set(file, module.exports)
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const localRequire = id => id.startsWith('.') ? load(path.resolve(path.dirname(file), id + '.ts')) : require(id)
  vm.runInNewContext(source, { module, exports: module.exports, require: localRequire, structuredClone, Date, Set }, { filename: file })
  cache.set(file, module.exports)
  return module.exports
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
