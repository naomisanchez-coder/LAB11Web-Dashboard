"use client";
import { CheckCheck, FolderKanban, ListTodo, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { metrics } from "@/lib/dashboard/model";
import { useDashboard } from "./DashboardProvider";
export function OverviewSection() {
  const { state } = useDashboard();
  const counts = metrics(state);
  const cards = [
    {
      label: "Total de proyectos",
      value: counts.projects,
      detail: `${counts.activeProjects} proyectos activos`,
      icon: FolderKanban,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Integrantes del equipo",
      value: counts.members,
      detail: `${counts.activeMembers} integrantes activos`,
      icon: Users,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total de tareas",
      value: counts.tasks,
      detail: `${counts.pending} pendientes`,
      icon: ListTodo,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Tareas completadas",
      value: counts.completed,
      detail: `${counts.progress} en progreso`,
      icon: CheckCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];
  return (
    <section aria-label="Resumen del espacio de trabajo" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="shadow-xs">
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </p>
                <span className={`rounded-lg p-2 ${c.tone}`}>
                  <c.icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-4xl font-semibold tracking-tight">
                {c.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{c.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-xs lg:col-span-3">
          <CardHeader>
            <CardTitle>Estado del trabajo</CardTitle>
            <CardDescription>
              Distribución de las tareas de esta sesión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                label: "Pendientes",
                count: counts.pending,
                color: "bg-amber-400",
              },
              {
                label: "En progreso",
                count: counts.progress,
                color: "bg-blue-500",
              },
              {
                label: "Completadas",
                count: counts.completed,
                color: "bg-emerald-500",
              },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
                <div
                  className="h-2 rounded-full bg-secondary"
                  role="progressbar"
                  aria-label={s.label}
                  aria-valuenow={s.count}
                  aria-valuemin={0}
                  aria-valuemax={Math.max(1, counts.tasks)}
                >
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{
                      width: `${counts.tasks ? (s.count / counts.tasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!counts.tasks && (
              <p className="text-sm text-muted-foreground">
                Crea tu primera tarea para ver la distribución.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-xs lg:col-span-2">
          <CardHeader>
            <CardTitle>Proyectos en foco</CardTitle>
            <CardDescription>Estado actual de tus proyectos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.projects
              .slice(-4)
              .reverse()
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {state.tasks.filter((t) => t.projectId === p.id).length}{" "}
                      tareas · {p.memberIds.length} integrantes
                    </p>
                  </div>
                  <Badge variant="secondary">{p.status}</Badge>
                </div>
              ))}
            {!state.projects.length && (
              <p className="text-sm text-muted-foreground">
                Todavía no hay proyectos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Tareas del equipo</CardTitle>
          <CardDescription>
            Una vista rápida de los últimos registros de la lista
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {state.tasks
            .slice(-4)
            .reverse()
            .map((t) => (
              <div key={t.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{t.title}</p>
                  <Badge variant="outline">{t.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {state.members.find((m) => m.userId === t.userId)?.name ??
                    "Sin responsable"}{" "}
                  ·{" "}
                  {state.projects.find((p) => p.id === t.projectId)?.name ??
                    "Sin proyecto"}
                </p>
              </div>
            ))}
          {!state.tasks.length && (
            <p className="text-sm text-muted-foreground">
              No hay tareas registradas.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
