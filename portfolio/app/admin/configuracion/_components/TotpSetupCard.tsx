"use client";

import { useState, useTransition } from "react";
import QRCode from "qrcode";
import {
  beginTotpSetup,
  confirmTotpSetup,
  disableTotp,
} from "../totp-actions";
import { Button } from "@/components/ui/Button";

type Phase =
  | { step: "inactive" }
  | { step: "setup"; uri: string; qrDataUrl: string; secret: string }
  | { step: "confirm"; secret: string }
  | { step: "done-codes"; codes: string[] }
  | { step: "active" }
  | { step: "disable-confirm" };

interface Props {
  initialEnabled: boolean;
  backupCodesLeft: number;
}

export function TotpSetupCard({ initialEnabled, backupCodesLeft }: Props) {
  const [phase, setPhase] = useState<Phase>(
    initialEnabled ? { step: "active" } : { step: "inactive" }
  );
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const clearError = () => setError(null);

  // ── Begin setup ────────────────────────────────────────────────────────────
  async function handleBeginSetup() {
    clearError();
    startTransition(async () => {
      const result = await beginTotpSetup();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const uri = result.data!.uri as string;
      const qrDataUrl = await QRCode.toDataURL(uri, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setPhase({ step: "setup", uri, qrDataUrl, secret: result.data!.secret as string });
    });
  }

  // ── Confirm setup ──────────────────────────────────────────────────────────
  async function handleConfirmSetup() {
    clearError();
    if (!code || !/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    startTransition(async () => {
      const result = await confirmTotpSetup(code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode("");
      setPhase({ step: "done-codes", codes: result.data!.backupCodes as string[] });
    });
  }

  // ── Disable ────────────────────────────────────────────────────────────────
  async function handleDisable() {
    clearError();
    if (!code || !/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    startTransition(async () => {
      const result = await disableTotp(code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode("");
      setPhase({ step: "inactive" });
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Status badge ── */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-semibold ${
            phase.step === "active" ||
            phase.step === "disable-confirm" ||
            phase.step === "done-codes"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-surface-card text-muted border border-hairline"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              phase.step === "active" ||
              phase.step === "disable-confirm" ||
              phase.step === "done-codes"
                ? "bg-emerald-500"
                : "bg-muted"
            }`}
          />
          {phase.step === "active" ||
          phase.step === "disable-confirm" ||
          phase.step === "done-codes"
            ? "Activo"
            : "Inactivo"}
        </span>
        {(phase.step === "active" || phase.step === "disable-confirm") && (
          <span className="text-body-sm text-muted">
            {backupCodesLeft} backup code{backupCodesLeft !== 1 ? "s" : ""} disponible{backupCodesLeft !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── INACTIVE: show activate button ── */}
      {phase.step === "inactive" && (
        <div className="space-y-3">
          <p className="text-body-sm text-muted">
            Activá el 2FA para agregar una capa extra de seguridad. Necesitás
            una app como <strong>Authy</strong>, Google Authenticator o
            Microsoft Authenticator.
          </p>
          <Button
            type="button"
            onClick={handleBeginSetup}
            disabled={isPending}
            className="w-fit"
          >
            {isPending ? "Generando QR..." : "Activar 2FA"}
          </Button>
        </div>
      )}

      {/* ── SETUP: show QR ── */}
      {phase.step === "setup" && (
        <div className="space-y-5">
          <p className="text-body-sm text-muted">
            Escaneá este QR con tu app de autenticación, luego ingresá el código
            de 6 dígitos para confirmar.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* QR Code */}
            <div className="rounded-xl border border-hairline bg-white p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={phase.qrDataUrl}
                alt="QR code para configurar 2FA"
                width={200}
                height={200}
                className="block"
              />
            </div>
            {/* Manual secret fallback */}
            <div className="space-y-2">
              <p className="text-caption text-muted">
                ¿No podés escanear?<br />Ingresá este código manualmente:
              </p>
              <code className="block rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-body-sm tracking-widest text-ink break-all">
                {phase.secret}
              </code>
            </div>
          </div>
          {/* Code input */}
          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold uppercase tracking-wider text-muted">
              Código de confirmación
            </label>
            <div className="flex items-center gap-3">
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
                onClick={handleConfirmSetup}
                disabled={isPending || code.length !== 6}
              >
                {isPending ? "Verificando..." : "Confirmar"}
              </Button>
              <button
                type="button"
                onClick={() => { setPhase({ step: "inactive" }); clearError(); setCode(""); }}
                className="text-body-sm text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DONE-CODES: show backup codes once ── */}
      {phase.step === "done-codes" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
            <p className="text-body-sm font-semibold text-amber-800">
              ¡2FA activado! Guardá estos backup codes ahora.
            </p>
            <p className="text-caption text-amber-700">
              Son de un solo uso. Si perdés acceso a tu app de autenticación,
              los vas a necesitar para entrar. <strong>No los vas a ver de nuevo.</strong>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {phase.codes.map((c, i) => (
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
            onClick={() => setPhase({ step: "active" })}
          >
            Ya los guardé ✓
          </Button>
        </div>
      )}

      {/* ── ACTIVE: show disable option ── */}
      {phase.step === "active" && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setPhase({ step: "disable-confirm" }); clearError(); setCode(""); }}
            className="text-body-sm text-error hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            Desactivar 2FA
          </button>
        </div>
      )}

      {/* ── DISABLE-CONFIRM: require current TOTP code ── */}
      {phase.step === "disable-confirm" && (
        <div className="space-y-3">
          <p className="text-body-sm text-muted">
            Ingresá un código de tu app para confirmar la desactivación.
          </p>
          <div className="flex items-center gap-3">
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
              onClick={handleDisable}
              disabled={isPending || code.length !== 6}
              className="bg-error hover:bg-error/90"
            >
              {isPending ? "Desactivando..." : "Confirmar desactivación"}
            </Button>
            <button
              type="button"
              onClick={() => { setPhase({ step: "active" }); clearError(); setCode(""); }}
              className="text-body-sm text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Error display ── */}
      {error && (
        <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
