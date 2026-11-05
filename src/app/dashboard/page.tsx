"use client"
import { FolderKanban, LayoutDashboard, ListTodo, Settings, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectForm } from "@/components/ProjectForm"
import { TasksTable } from "@/components/TaskTable"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardProvider"
import { ProjectsSection } from "@/components/dashboard/ProjectsSection"
import { TeamSection } from "@/components/dashboard/TeamSection"
import { OverviewSection } from "@/components/dashboard/OverviewSection"
import { SettingsSection } from "@/components/dashboard/SettingsSection"
const sections = [{ id: "overview", label: "Resumen", icon: LayoutDashboard }, { id: "projects", label: "Proyectos", icon: FolderKanban }, { id: "team", label: "Equipo", icon: Users }, { id: "tasks", label: "Tareas", icon: ListTodo }, { id: "settings", label: "Configuración", icon: Settings }]
function Workspace() {
  const { state } = useDashboard()
  return <div className="space-y-7"><div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="mb-2 text-sm font-medium text-primary">Hola, {state.settings.name.split(" ")[0]}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard de Proyectos</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Gestiona tus proyectos y tareas con shadcn/ui</p></div><ProjectForm /></div><Tabs defaultValue="overview" className="min-w-0 gap-6"><TabsList aria-label="Secciones del Dashboard" className="h-auto w-full max-w-full justify-start gap-1 overflow-x-auto rounded-xl border bg-card p-1.5 shadow-xs">{sections.map(s => <TabsTrigger key={s.id} value={s.id} className="min-h-11 shrink-0 gap-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-5"><s.icon aria-hidden="true" className="size-4" />{s.label}</TabsTrigger>)}</TabsList><TabsContent value="overview"><OverviewSection /></TabsContent><TabsContent value="projects"><ProjectsSection /></TabsContent><TabsContent value="team"><TeamSection /></TabsContent><TabsContent value="tasks"><TasksTable /></TabsContent><TabsContent value="settings"><SettingsSection /></TabsContent></Tabs></div>
}
export default function DashboardPage() { return <DashboardShell><DashboardProvider><Workspace /></DashboardProvider></DashboardShell> }
