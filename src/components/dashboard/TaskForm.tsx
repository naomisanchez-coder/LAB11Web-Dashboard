"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Task, type TaskStatus, type Priority, priorities, taskStatuses } from "@/lib/dashboard/model"
import { applyAction } from "@/lib/dashboard/operations"
import { useDashboard } from "./DashboardProvider"
import { Choice, DateField, FormError, SaveButton } from "./FormControls"
const empty = (): Task => ({ id: "", title: "", description: "", projectId: "", status: "Pendiente", priority: "Media", userId: "", deadline: "" })
export function TaskForm({ task, onSaved }: { task?: Task; onSaved?: () => void }) {
  const { state, busy, run } = useDashboard(); const [open, setOpen] = useState(false), [error, setError] = useState("")
  const [data, setData] = useState<Task>(() => task ?? empty()); const id = `task-${task?.id ?? "new"}`
  const project = state.projects.find(p => p.id === data.projectId)
  const members = state.members.filter(m => project?.memberIds.includes(m.userId))
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    const action = { type: "task/save" as const, task: { ...data, id: task?.id ?? crypto.randomUUID() }, create: !task }
    const invalid = applyAction(state, action).error
    if (invalid) { setError(invalid); return }
    const failure = await run(action, task ? "Tarea actualizada." : "Tarea creada.")
    if (failure) setError(failure); else { setOpen(false); onSaved?.() }
  }
  return <Dialog open={open} onOpenChange={v => { if (!busy) { setOpen(v); setError(""); if (v) setData(task ?? empty()) } }}><DialogTrigger asChild><Button variant={task ? "outline" : "default"} size={task ? "sm" : "default"} aria-label={task ? `Editar ${task.title}` : "Nueva tarea"}>{task ? "Editar" : "Nueva tarea"}</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{task ? "Editar tarea" : "Crear tarea"}</DialogTitle><DialogDescription>Asigna un proyecto, un responsable de ese equipo y una fecha límite. Todos los campos son obligatorios.</DialogDescription></DialogHeader><form onSubmit={submit} noValidate className="space-y-4"><fieldset disabled={busy} className="space-y-4"><div className="space-y-2"><Label htmlFor={`${id}-title`}>Título *</Label><Input id={`${id}-title`} required value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></div><div className="space-y-2"><Label htmlFor={`${id}-description`}>Descripción *</Label><Input id={`${id}-description`} required value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`${id}-project`}>Proyecto *</Label><Choice id={`${id}-project`} label="Selecciona un proyecto" value={data.projectId} options={state.projects.map(p => ({ value: p.id, label: p.name }))} onChange={projectId => setData({ ...data, projectId, userId: "" })} /></div><div className="space-y-2"><Label htmlFor={`${id}-user`}>Responsable *</Label><Choice id={`${id}-user`} label="Selecciona un integrante" value={data.userId} disabled={!members.length} options={members.map(m => ({ value: m.userId, label: m.name }))} onChange={userId => setData({ ...data, userId })} />{!members.length && <p className="text-xs text-muted-foreground">Selecciona un proyecto con miembros asignados.</p>}</div><div className="space-y-2"><Label htmlFor={`${id}-status`}>Estado *</Label><Choice id={`${id}-status`} label="Estado" value={data.status} options={taskStatuses.map(value => ({ value, label: value }))} onChange={v => setData({ ...data, status: v as TaskStatus })} /></div><div className="space-y-2"><Label htmlFor={`${id}-priority`}>Prioridad *</Label><Choice id={`${id}-priority`} label="Prioridad" value={data.priority} options={priorities.map(value => ({ value, label: value }))} onChange={v => setData({ ...data, priority: v as Priority })} /></div></div><DateField id={`${id}-deadline`} label="Fecha límite *" value={data.deadline} onChange={deadline => setData({ ...data, deadline })} /></fieldset><FormError error={error} /><DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button><SaveButton busy={busy}>{task ? "Guardar cambios" : "Crear tarea"}</SaveButton></DialogFooter></form></DialogContent></Dialog>
}
