import { taskStatuses, emailValid, validDate, localDate, categories, priorities, type Action, type DashboardState } from "./model"
export interface Result { state: DashboardState; error?: string }
export function applyAction(state: DashboardState, action: Action): Result {
  const fail = (error: string): Result => ({ state, error })
  switch (action.type) {
    case "project/create": {
      const p = action.project
      if (!p.id || state.projects.some(x => x.id === p.id)) return fail("El identificador del proyecto ya existe.")
      if (!p.name.trim() || !p.description.trim() || !(p.category in categories) || !priorities.includes(p.priority)) return fail("Completa nombre, descripción, categoría y prioridad.")
      if (state.projects.some(x => x.name.trim().toLowerCase() === p.name.trim().toLowerCase())) return fail("Ya existe un proyecto con ese nombre.")
      if (p.memberIds.some(id => !state.members.some(m => m.userId === id))) return fail("Selecciona integrantes existentes.")
      const project = { ...p, name: p.name.trim(), description: p.description.trim(), memberIds: [...new Set(p.memberIds)] }
      return { state: { ...state, projects: [...state.projects, project], members: state.members.map(m => project.memberIds.includes(m.userId) && !m.projectId ? { ...m, projectId: p.id } : m) } }
    }
    case "project/delete": {
      if (!state.projects.some(p => p.id === action.id)) return fail("El proyecto ya no existe.")
      if (state.tasks.some(t => t.projectId === action.id)) return fail("Este proyecto tiene tareas asociadas. Elimina o reasigna sus tareas antes de continuar.")
      return { state: { ...state, projects: state.projects.filter(p => p.id !== action.id), members: state.members.map(m => m.projectId === action.id ? { ...m, projectId: null } : m) } }
    }
    case "member/save": {
      const m = action.member
      const existing = state.members.find(x => x.userId === m.userId)
      if (!m.userId || (action.create ? !!existing : !existing)) return fail("El integrante ya existe o no está disponible.")
      if (!m.name.trim() || !m.role.trim() || !m.position.trim() || !emailValid(m.email.trim())) return fail("Completa nombre, rol, puesto y un correo válido.")
      if (!validDate(m.birthdate) || m.birthdate >= localDate(new Date())) return fail("Selecciona una fecha de nacimiento anterior a hoy.")
      if (!/^[+\d\s()-]{7,22}$/.test(m.phone.trim()) || m.phone.replace(/\D/g, "").length < 7) return fail("Ingresa un teléfono válido de al menos siete dígitos.")
      if (state.members.some(x => x.userId !== m.userId && x.email.trim().toLowerCase() === m.email.trim().toLowerCase())) return fail("Ese correo ya pertenece a otro integrante.")
      if (m.projectId && !state.projects.some(p => p.id === m.projectId)) return fail("Selecciona un proyecto existente.")
      const member = { ...m, name: m.name.trim(), role: m.role.trim(), position: m.position.trim(), email: m.email.trim(), phone: m.phone.trim() }
      const projects = state.projects.map(p => {
        let ids = p.memberIds
        if (existing?.projectId === p.id && p.id !== m.projectId && !state.tasks.some(t => t.projectId === p.id && t.userId === m.userId)) ids = ids.filter(id => id !== m.userId)
        if (p.id === m.projectId) ids = [...new Set([...ids, m.userId])]
        return { ...p, memberIds: ids }
      })
      return { state: { ...state, projects, members: action.create ? [...state.members, member] : state.members.map(x => x.userId === m.userId ? member : x) } }
    }
    case "member/delete": {
      if (!state.members.some(m => m.userId === action.id)) return fail("El integrante ya no existe.")
      if (state.tasks.some(t => t.userId === action.id)) return fail("Este integrante tiene tareas asignadas. Reasígnalas o elimínalas antes de continuar.")
      return { state: { ...state, members: state.members.filter(m => m.userId !== action.id), projects: state.projects.map(p => ({ ...p, memberIds: p.memberIds.filter(id => id !== action.id) })) } }
    }
    case "member/toggle": {
      if (!state.members.some(m => m.userId === action.id)) return fail("El integrante ya no existe.")
      return { state: { ...state, members: state.members.map(m => m.userId === action.id ? { ...m, isActive: action.isActive } : m) } }
    }
    case "task/save": {
      const t = action.task
      const existing = state.tasks.some(x => x.id === t.id)
      if (!t.id || (action.create ? existing : !existing)) return fail("La tarea ya existe o no está disponible.")
      if (!t.title.trim() || !t.description.trim() || !taskStatuses.includes(t.status) || !priorities.includes(t.priority)) return fail("Completa título, descripción, estado y prioridad.")
      if (!validDate(t.deadline)) return fail("Selecciona una fecha límite válida.")
      const project = state.projects.find(p => p.id === t.projectId)
      if (!project) return fail("Selecciona un proyecto existente.")
      if (!state.members.some(m => m.userId === t.userId) || !project.memberIds.includes(t.userId)) return fail("El responsable debe pertenecer al proyecto seleccionado.")
      const task = { ...t, title: t.title.trim(), description: t.description.trim() }
      return { state: { ...state, tasks: action.create ? [...state.tasks, task] : state.tasks.map(x => x.id === t.id ? task : x) } }
    }
    case "task/delete": {
      if (!state.tasks.some(t => t.id === action.id)) return fail("La tarea ya no existe.")
      return { state: { ...state, tasks: state.tasks.filter(t => t.id !== action.id) } }
    }
  }
}
