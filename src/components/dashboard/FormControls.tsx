"use client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { dateValue, localDate } from "@/lib/dashboard/model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FormError({ error }: { error: string }) { return error ? <Alert variant="destructive" role="alert"><AlertTitle>Revisa la información</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null }
export function SaveButton({ busy, children = "Guardar cambios" }: { busy: boolean; children?: React.ReactNode }) { return <Button type="submit" disabled={busy}>{busy && <Spinner aria-hidden="true" />}{busy ? "Procesando…" : children}</Button> }
export function Choice({ id, label, value, options, onChange, disabled = false }: { id: string; label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; disabled?: boolean }) {
  return <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} aria-label={label} className="w-full"><SelectValue placeholder={label} /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
}
export function DateField({ id, label, value, onChange, birthdate = false }: { id: string; label: string; value: string; onChange: (v: string) => void; birthdate?: boolean }) {
  return <details className="rounded-lg border bg-background p-3"><summary id={id} className="cursor-pointer text-sm font-medium">{label}: {value || "Seleccionar fecha"}</summary><div className="mt-2 max-w-full overflow-x-auto"><Calendar mode="single" selected={dateValue(value)} onSelect={d => onChange(d ? localDate(d) : "")} captionLayout="dropdown" startMonth={new Date(1900, 0)} endMonth={birthdate ? new Date() : new Date(2100, 11)} disabled={birthdate ? { after: new Date() } : undefined} /></div></details>
}
