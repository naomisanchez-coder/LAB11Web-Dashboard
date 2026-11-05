"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Settings } from "@/lib/dashboard/model"
import { applyAction } from "@/lib/dashboard/operations"
import { useDashboard } from "./DashboardProvider"
import { Choice, FormError, SaveButton } from "./FormControls"
export function SettingsSection() {
  const { state, busy, run } = useDashboard(); const [data, setData] = useState(state.settings); const [error, setError] = useState("")
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (busy) return
    const action = { type: "settings/save" as const, settings: data }
    const invalid = applyAction(state, action).error
    if (invalid) { setError(invalid); return }
    const failure = await run(action, "Preferencias guardadas en esta sesión."); setError(failure ?? "")
  }
  return <Card className="max-w-3xl shadow-xs"><CardHeader><CardTitle>Configuración del espacio</CardTitle><CardDescription>Personaliza tu experiencia. Las preferencias se guardan durante esta sesión y se reinician al recargar.</CardDescription></CardHeader><CardContent><form onSubmit={save} noValidate className="space-y-6"><fieldset disabled={busy} className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="settings-name">Nombre del usuario *</Label><Input id="settings-name" autoComplete="name" required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="settings-email">Correo electrónico *</Label><Input id="settings-email" autoComplete="email" type="email" required value={data.email} onChange={e => setData({ ...data, email: e.target.value })} /></div></div><div className="flex items-center justify-between gap-4 rounded-lg border p-4"><div><Label htmlFor="settings-notifications">Notificaciones</Label><p className="mt-1 text-sm text-muted-foreground">Preferencia simulada; no envía correos ni avisos externos.</p></div><Switch id="settings-notifications" checked={data.notifications} onCheckedChange={notifications => setData({ ...data, notifications })} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="settings-view">Visualización de la tabla</Label><Choice id="settings-view" label="Visualización" value={data.view} options={[{ value: "comfortable", label: "Cómoda" }, { value: "compact", label: "Compacta" }]} onChange={view => setData({ ...data, view: view as Settings["view"] })} /></div><div className="space-y-2"><Label htmlFor="settings-page-size">Tareas por página</Label><Choice id="settings-page-size" label="Registros por página" value={String(data.pageSize)} options={[3, 5, 10, 20].map(v => ({ value: String(v), label: `${v} registros` }))} onChange={v => setData({ ...data, pageSize: Number(v) })} /></div></div></fieldset><FormError error={error} /><SaveButton busy={busy}>Guardar preferencias</SaveButton></form></CardContent></Card>
}
