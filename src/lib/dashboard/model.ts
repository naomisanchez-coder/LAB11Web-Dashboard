export const priorities = ["Baja", "Media", "Alta", "Urgente"] as const
export type Priority = typeof priorities[number]
export const taskStatuses = ["Pendiente", "En progreso", "Completado"] as const
export type TaskStatus = typeof taskStatuses[number]
export const categories = { web: "Desarrollo Web", mobile: "Desarrollo Mobile", design: "Diseño", marketing: "Marketing", other: "Otro" } as const
export type Category = keyof typeof categories
export interface Project {
  id: string; name: string; description: string; category: Category; priority: Priority
  status: "Planificado" | "En progreso" | "En revisión" | "Completado"
  progress: number; memberIds: string[]
}
export interface Member {
  userId: string; role: string; name: string; email: string; position: string
  birthdate: string; phone: string; projectId: string | null; isActive: boolean
}
// Equivalencias de la guía: prjectId → projectId, dateline → deadline.
export interface Task {
  id: string; title: string; description: string; projectId: string
  status: TaskStatus; priority: Priority; userId: string; deadline: string
}
export interface Settings { name: string; email: string; notifications: boolean; view: "comfortable" | "compact"; pageSize: number }
export interface DashboardState { projects: Project[]; members: Member[]; tasks: Task[]; settings: Settings }
export type Action =
  | { type: "project/create"; project: Project }
  | { type: "project/delete"; id: string }
  | { type: "member/save"; member: Member; create: boolean }
  | { type: "member/delete"; id: string }
  | { type: "member/toggle"; id: string; isActive: boolean }
export const emailValid = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
export function validDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = s.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}
export function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
export function dateValue(s: string) { return validDate(s) ? new Date(`${s}T12:00:00`) : undefined }
export function metrics(state: DashboardState) {
  return {
    projects: state.projects.length, activeProjects: state.projects.filter(p => p.status !== "Completado").length,
    members: state.members.length, activeMembers: state.members.filter(m => m.isActive).length,
    tasks: state.tasks.length, pending: state.tasks.filter(t => t.status === "Pendiente").length,
    progress: state.tasks.filter(t => t.status === "En progreso").length,
    completed: state.tasks.filter(t => t.status === "Completado").length,
  }
}
