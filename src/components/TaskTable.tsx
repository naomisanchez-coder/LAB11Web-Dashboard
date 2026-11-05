"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  paginate,
  type Priority,
  type TaskStatus,
} from "@/lib/dashboard/model";
import { useDashboard } from "./dashboard/DashboardProvider";
import { TaskForm } from "./dashboard/TaskForm";
import { ConfirmDelete } from "./dashboard/ConfirmDelete";
const statusClasses: Record<TaskStatus, string> = {
  Pendiente: "border-amber-200 bg-amber-50 text-amber-900",
  "En progreso": "border-blue-200 bg-blue-50 text-blue-900",
  Completado: "border-emerald-200 bg-emerald-50 text-emerald-900",
};
const priorityClasses: Record<Priority, string> = {
  Baja: "bg-secondary text-secondary-foreground",
  Media: "border-blue-200 bg-blue-50 text-blue-900",
  Alta: "border-amber-200 bg-amber-50 text-amber-900",
  Urgente: "border-red-200 bg-red-50 text-red-900",
};
export function TasksTable() {
  const { state } = useDashboard();
  const [requestedPage, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const { page, totalPages, pageSize, records } = paginate(
    state.tasks,
    requestedPage,
    state.settings.pageSize,
  );
  const selectedCount = selected.filter((id) =>
    state.tasks.some((t) => t.id === id),
  ).length;
  const all =
      records.length > 0 && records.every((t) => selected.includes(t.id)),
    some = records.some((t) => selected.includes(t.id));
  return (
    <section aria-labelledby="tasks-title" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="tasks-title" className="text-xl font-semibold">
            Gestión de Tareas
          </h2>
          <p className="text-sm text-muted-foreground">
            Administra todas las tareas de tus proyectos
          </p>
        </div>
        <TaskForm
          onSaved={() =>
            setPage(Math.ceil((state.tasks.length + 1) / pageSize))
          }
        />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableCaption className="pb-4">
            {state.tasks.length} tareas en total · {selectedCount} seleccionadas
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Seleccionar tareas de esta página"
                  checked={all ? true : some ? "indeterminate" : false}
                  onCheckedChange={(v) =>
                    setSelected(
                      v === true
                        ? [
                            ...new Set([
                              ...selected,
                              ...records.map((t) => t.id),
                            ]),
                          ]
                        : selected.filter(
                            (id) => !records.some((t) => t.id === id),
                          ),
                    )
                  }
                />
              </TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length ? (
              records.map((t) => (
                <TableRow
                  key={t.id}
                  className={
                    state.settings.view === "compact"
                      ? "[&>td]:py-2"
                      : "[&>td]:py-4"
                  }
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`Seleccionar ${t.title}`}
                      checked={selected.includes(t.id)}
                      onCheckedChange={(v) =>
                        setSelected(
                          v === true
                            ? [...new Set([...selected, t.id])]
                            : selected.filter((id) => id !== t.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-48 max-w-72 whitespace-normal">
                    <p className="font-medium">{t.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    {state.projects.find((p) => p.id === t.projectId)?.name ??
                      "Sin proyecto"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusClasses[t.status]}
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={priorityClasses[t.priority]}
                    >
                      {t.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {state.members.find((m) => m.userId === t.userId)?.name ??
                      "Sin responsable"}
                  </TableCell>
                  <TableCell>
                    <time dateTime={t.deadline}>
                      {t.deadline.split("-").reverse().join("/")}
                    </time>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <TaskForm task={t} />
                      <ConfirmDelete
                        name={t.title}
                        action={{ type: "task/delete", id: t.id }}
                        consequence="Se quitará esta tarea y se actualizarán las métricas."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-14 text-center text-muted-foreground"
                >
                  No hay tareas todavía. Crea una para organizar el siguiente
                  paso.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="shrink-0 text-sm text-muted-foreground">
          {state.tasks.length
            ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, state.tasks.length)}`
            : "0"}{" "}
          de {state.tasks.length} registros
        </p>
        <Pagination className="mx-0 w-auto" aria-label="Paginación de tareas">
          <PaginationContent className="flex-wrap justify-center">
            <PaginationItem>
              <PaginationPrevious
                href="#tasks-title"
                aria-label="Página anterior"
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
                className={page === 1 ? "pointer-events-none opacity-40" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              >
                Anterior
              </PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#tasks-title"
                    aria-label={`Página ${p}`}
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext
                href="#tasks-title"
                aria-label="Página siguiente"
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : 0}
                className={
                  page === totalPages ? "pointer-events-none opacity-40" : ""
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
              >
                Siguiente
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
