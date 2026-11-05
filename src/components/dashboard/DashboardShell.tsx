import { Layers3, LayoutDashboard } from "lucide-react"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary p-2.5 text-primary-foreground"><Layers3 aria-hidden="true" className="size-6" /></span>
            <div><p className="text-lg font-bold tracking-tight">Nexo<span className="text-primary">Proyectos</span></p><p className="text-xs text-muted-foreground">Tu equipo, en sintonía</p></div>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground sm:flex"><LayoutDashboard aria-hidden="true" className="size-3.5" /> Espacio de trabajo</span>
        </div>
      </header>
      <main id="contenido" className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-8">Laboratorio 11 · Tecsup · Datos de demostración en memoria</footer>
    </div>
  )
}
