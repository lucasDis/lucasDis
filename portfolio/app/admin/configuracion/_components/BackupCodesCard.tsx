"use client";

import { useState, useTransition } from "react";
import { regenerateBackupCodes } from "../totp-actions";
import { Button } from "@/components/ui/Button";

interface Props {
  initialLeft: number;
}

export function BackupCodesCard({ initialLeft }: Props) {
  const [left, setLeft] = useState(initialLeft);
  const [phase, setPhase] = useState<"idle" | "confirm" | "done">("idle");
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleRegenerate() {
    setError(null);
    if (!code || !/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    startTransition(async () => {
      const result = await regenerateBackupCodes(code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const codes = result.data!.backupCodes as string[];
      setNewCodes(codes);
      setLeft(codes.length);
      setCode("");
      setPhase("done");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-body-md text-ink font-semibold">
          {left} de 8
        </span>
        <span className="text-body-sm text-muted">backup codes disponibles</span>
      </div>

      {left <= 2 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-800">
          Quedan pocos backup codes. Regeneralos pronto.
        </div>
      )}

      {phase === "idle" && (
        <button
          type="button"
          onClick={() => { setPhase("confirm"); setError(null); }}
          className="text-body-sm text-muted hover:text-ink underline underline-offset-4 transition-colors cursor-pointer"
        >
          Regenerar backup codes
        </button>
      )}

      {phase === "confirm" && (
        <div className="space-y-3">
          <p className="text-body-sm text-muted">
            Ingresá un código de tu app para confirmar. Los backup codes
            actuales quedarán invalidados.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="h-11 w-36 rounded-md border border-hairline bg-canvas px-3 text-center font-mono text-title-sm tracking-[0.3em] text-ink outline-none transition-colors focus:border-primary"
            />
            <Button
              type="button"
              onClick={handleRegenerate}
              disabled={isPending || code.length !== 6}
            >
              {isPending ? "Regenerando..." : "Regenerar"}
            </Button>
            <button
              type="button"
              onClick={() => { setPhase("idle"); setError(null); setCode(""); }}
              className="text-body-sm text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
            <p className="text-body-sm font-semibold text-amber-800">
              Nuevos backup codes generados. Guardalos ahora.
            </p>
            <p className="text-caption text-amber-700">
              Los anteriores ya no son válidos. <strong>No los vas a ver de nuevo.</strong>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {newCodes.map((c, i) => (
              <code
                key={i}
                className="rounded-lg border border-hairline bg-canvas px-3 py-2 text-center font-mono text-body-sm tracking-widest text-ink"
              >
                {c}
              </code>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => setPhase("idle")}
          >
            Ya los guardé ✓
          </Button>
        </div>
      )}

      {error && (
        <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
