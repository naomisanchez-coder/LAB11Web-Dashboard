"use client"
import { createContext, useContext, useRef, useState } from "react"
import { initialState } from "@/lib/dashboard/initial-data"
import { applyAction } from "@/lib/dashboard/operations"
import type { Action, DashboardState } from "@/lib/dashboard/model"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Store { state: DashboardState; busy: boolean; run: (action: Action, success: string) => Promise<string | undefined> }
const Context = createContext<Store | null>(null)
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  const current = useRef(state)
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")
  async function run(action: Action, success: string) {
    if (lock.current) return "Hay otra operación en curso. Espera un momento."
    lock.current = true; setBusy(true)
    try {
      // Simulación local; no se realiza ninguna petición a un backend.
      await new Promise(resolve => setTimeout(resolve, 450))
      const result = applyAction(current.current, action)
      if (result.error) return result.error
      current.current = result.state; setState(result.state); setNotice(success)
    } finally { lock.current = false; setBusy(false) }
  }
  return <Context.Provider value={{ state, busy, run }}>
    {notice && <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-950" role="status"><AlertTitle>Operación completada</AlertTitle><AlertDescription className="flex items-center justify-between gap-3 text-emerald-900">{notice}<button type="button" onClick={() => setNotice("")} className="shrink-0 underline">Cerrar mensaje</button></AlertDescription></Alert>}
    {children}
  </Context.Provider>
}
export function useDashboard() { const store = useContext(Context); if (!store) throw new Error("Falta DashboardProvider"); return store }
