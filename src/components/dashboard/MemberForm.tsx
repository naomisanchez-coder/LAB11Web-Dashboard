"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { type Member } from "@/lib/dashboard/model"
import { applyAction } from "@/lib/dashboard/operations"
import { useDashboard } from "./DashboardProvider"
import { Choice, DateField, FormError, SaveButton } from "./FormControls"
const empty = (): Member => ({ userId: "", name: "", email: "", role: "", position: "", birthdate: "", phone: "", projectId: null, isActive: true })
export function MemberForm({ member }: { member?: Member }) {
  const { state, busy, run } = useDashboard(); const [open, setOpen] = useState(false), [error, setError] = useState("")
  const [data, setData] = useState<Member>(() => member ?? empty())
  const id = `member-${member?.userId ?? "new"}`
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    const action = { type: "member/save" as const, member: { ...data, userId: member?.userId ?? crypto.randomUUID() }, create: !member }
    const invalid = applyAction(state, action).error
    if (invalid) { setError(invalid); return }
    const failure = await run(action, member ? "Integrante actualizado." : "Integrante registrado.")
    if (failure) setError(failure); else setOpen(false)
  }
  return <Dialog open={open} onOpenChange={v => { if (!busy) { setOpen(v); setError(""); if (v) setData(member ?? empty()) } }}><DialogTrigger asChild><Button variant={member ? "outline" : "default"} size={member ? "sm" : "default"} aria-label={member ? `Editar ${member.name}` : "Nuevo integrante"}>{member ? "Editar" : "Nuevo integrante"}</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{member ? "Editar integrante" : "Registrar integrante"}</DialogTitle><DialogDescription>Completa los datos personales y la asignación principal. Los campos con * son obligatorios.</DialogDescription></DialogHeader><form noValidate onSubmit={submit} className="space-y-4"><fieldset disabled={busy} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{([{ key: "name", label: "Nombre", type: "text" }, { key: "email", label: "Correo electrónico", type: "email" }, { key: "role", label: "Rol", type: "text" }, { key: "position", label: "Puesto", type: "text" }, { key: "phone", label: "Teléfono", type: "tel" }] as const).map(f => <div key={f.key} className="space-y-2"><Label htmlFor={`${id}-${f.key}`}>{f.label} *</Label><Input id={`${id}-${f.key}`} type={f.type} required value={data[f.key]} onChange={e => setData({ ...data, [f.key]: e.target.value })} /></div>)}<div className="space-y-2"><Label htmlFor={`${id}-project`}>Proyecto principal</Label><Choice id={`${id}-project`} label="Proyecto asignado" value={data.projectId ?? "none"} onChange={v => setData({ ...data, projectId: v === "none" ? null : v })} options={[{ value: "none", label: "Sin asignación" }, ...state.projects.map(p => ({ value: p.id, label: p.name }))]} /></div></div><DateField id={`${id}-birthdate`} label="Fecha de nacimiento *" value={data.birthdate} onChange={birthdate => setData({ ...data, birthdate })} birthdate /><div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor={`${id}-active`}>Integrante activo</Label><Switch id={`${id}-active`} checked={data.isActive} onCheckedChange={isActive => setData({ ...data, isActive })} /></div></fieldset><FormError error={error} /><DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button><SaveButton busy={busy}>{member ? "Guardar cambios" : "Registrar integrante"}</SaveButton></DialogFooter></form></DialogContent></Dialog>
}
