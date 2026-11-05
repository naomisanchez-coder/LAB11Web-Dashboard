"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormError } from "./FormControls";
import { Spinner } from "@/components/ui/spinner";
import { useDashboard } from "./DashboardProvider";
import type { Action } from "@/lib/dashboard/model";
export function ConfirmDelete({
  name,
  action,
  consequence,
}: {
  name: string;
  action: Action;
  consequence: string;
}) {
  const { busy, run } = useDashboard();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          setOpen(v);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          aria-label={`Eliminar ${name}`}
        >
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar «{name}»</DialogTitle>
          <DialogDescription>
            {consequence} Esta acción requiere tu confirmación.
          </DialogDescription>
        </DialogHeader>
        <FormError error={error} />
        <DialogFooter>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              const e = await run(action, `Se eliminó ${name}.`);
              if (e) setError(e);
              else setOpen(false);
            }}
          >
            {busy && <Spinner aria-hidden="true" />}Confirmar eliminación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
