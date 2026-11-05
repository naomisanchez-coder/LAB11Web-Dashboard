import { categories, priorities, type Action, type DashboardState } from "./model"
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
  }
}
