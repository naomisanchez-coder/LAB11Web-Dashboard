"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { categories, priorities, type Category, type Priority, type Project } from "@/lib/dashboard/model"
import { applyAction } from "@/lib/dashboard/operations"
import { useDashboard } from "./dashboard/DashboardProvider"
import { Choice, FormError, SaveButton } from "./dashboard/FormControls"
const empty = () => ({ name: "", description: "", category: "", priority: "", memberIds: [] as string[] })
export function ProjectForm() {
  const { state, run, busy } = useDashboard()
  const [open, setOpen] = useState(false), [error, setError] = useState("")
  const [formData, setFormData] = useState(empty)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    const project: Project = { ...formData, id: crypto.randomUUID(), category: formData.category as Category, priority: formData.priority as Priority, status: "Planificado", progress: 0 }
    const action = { type: "project/create" as const, project }
    const invalid = applyAction(state, action).error
    if (invalid) { setError(invalid); return }
    const failure = await run(action, `Proyecto «${project.name.trim()}» creado.`)
    if (failure) setError(failure)
    else { setFormData(empty()); setError(""); setOpen(false) }
  }
  return <Dialog open={open} onOpenChange={v => { if (!busy) { setOpen(v); setError("") } }}>
    <DialogTrigger asChild><Button><Plus aria-hidden="true" className="size-4" />Nuevo Proyecto</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Crear Nuevo Proyecto</DialogTitle><DialogDescription>Define el proyecto y selecciona a tu equipo.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} noValidate className="space-y-4"><fieldset disabled={busy} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="project-name">Nombre del proyecto *</Label><Input id="project-name" autoComplete="off" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="project-description">Descripción *</Label><Input id="project-description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="project-category">Categoría *</Label><Choice id="project-category" label="Selecciona una categoría" value={formData.category} options={Object.entries(categories).map(([value, label]) => ({ value, label }))} onChange={category => setFormData({ ...formData, category })} /></div><div className="space-y-2"><Label htmlFor="project-priority">Prioridad *</Label><Choice id="project-priority" label="Selecciona prioridad" value={formData.priority} options={priorities.map(value => ({ value, label: value }))} onChange={priority => setFormData({ ...formData, priority })} /></div></div>
        <fieldset className="space-y-3 rounded-lg border p-4"><legend className="px-1 text-sm font-medium">Miembros del equipo ({formData.memberIds.length})</legend>{state.members.length ? state.members.map(m => <label key={m.userId} className="flex cursor-pointer items-center gap-3 text-sm"><Checkbox checked={formData.memberIds.includes(m.userId)} onCheckedChange={checked => setFormData({ ...formData, memberIds: checked === true ? [...new Set([...formData.memberIds, m.userId])] : formData.memberIds.filter(id => id !== m.userId) })} />{m.name}<span className="text-xs text-muted-foreground">{m.isActive ? m.role : "Inactivo"}</span></label>) : <p className="text-sm text-muted-foreground">Puedes crear el proyecto sin miembros y asignarlos desde Equipo.</p>}</fieldset>
      </fieldset><FormError error={error} /><DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button><SaveButton busy={busy}>Crear Proyecto</SaveButton></DialogFooter></form>
    </DialogContent>
  </Dialog>
}
