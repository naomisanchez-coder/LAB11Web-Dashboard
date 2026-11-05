import type { DashboardState, Project, Member, Task } from "./model"

const projects: Project[] = [
  { id: "p1", name: "E-commerce Platform", description: "Plataforma de comercio electrónico con Next.js", category: "web", priority: "Alta", status: "En progreso", progress: 65, memberIds: ["u1", "u2"] },
  { id: "p2", name: "Mobile App", description: "Aplicación móvil con React Native", category: "mobile", priority: "Media", status: "En revisión", progress: 90, memberIds: ["u3"] },
  { id: "p3", name: "Dashboard Analytics", description: "Panel de análisis con visualizaciones", category: "web", priority: "Media", status: "Planificado", progress: 20, memberIds: [] },
  { id: "p4", name: "API Gateway", description: "Microservicios con Node.js", category: "web", priority: "Alta", status: "En progreso", progress: 45, memberIds: ["u4", "u5"] },
  { id: "p5", name: "Design System", description: "Librería de componentes reutilizables", category: "design", priority: "Baja", status: "Completado", progress: 100, memberIds: [] },
  { id: "p6", name: "Marketing Website", description: "Sitio web institucional", category: "marketing", priority: "Media", status: "En progreso", progress: 75, memberIds: [] },
]
const members: Member[] = [
  { userId: "u1", name: "María García", email: "maria@example.com", role: "Frontend Developer", position: "Frontend Developer", projectId: "p1", isActive: true, birthdate: "", phone: "" },
  { userId: "u2", name: "Juan Pérez", email: "juan@example.com", role: "Backend Developer", position: "Backend Developer", projectId: "p1", isActive: true, birthdate: "", phone: "" },
  { userId: "u3", name: "Ana López", email: "ana@example.com", role: "UI/UX Designer", position: "UI/UX Designer", projectId: "p2", isActive: false, birthdate: "", phone: "" },
  { userId: "u4", name: "Carlos Ruiz", email: "carlos@example.com", role: "DevOps Engineer", position: "DevOps Engineer", projectId: "p4", isActive: true, birthdate: "", phone: "" },
  { userId: "u5", name: "Laura Martínez", email: "laura@example.com", role: "Project Manager", position: "Project Manager", projectId: "p4", isActive: true, birthdate: "", phone: "" },
]
const tasks: Task[] = [
  { id: "t1", title: "Implementar autenticación", description: "Implementar autenticación", projectId: "p1", status: "En progreso", priority: "Alta", userId: "u1", deadline: "2025-11-15" },
  { id: "t2", title: "Diseñar pantalla de perfil", description: "Diseñar pantalla de perfil", projectId: "p2", status: "Pendiente", priority: "Media", userId: "u3", deadline: "2025-11-20" },
  { id: "t3", title: "Configurar CI/CD", description: "Configurar CI/CD", projectId: "p4", status: "Completado", priority: "Alta", userId: "u4", deadline: "2025-11-10" },
  { id: "t4", title: "Optimizar queries SQL", description: "Optimizar queries SQL", projectId: "p1", status: "En progreso", priority: "Urgente", userId: "u2", deadline: "2025-11-12" },
  { id: "t5", title: "Documentar API endpoints", description: "Documentar API endpoints", projectId: "p4", status: "Pendiente", priority: "Baja", userId: "u5", deadline: "2025-11-25" },
]
export function initialState(): DashboardState {
  return structuredClone({ projects, members, tasks, settings: { name: "Naomi Sánchez Chavarría", email: "", notifications: true, view: "comfortable", pageSize: 5 } })
}
