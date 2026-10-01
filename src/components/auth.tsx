import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../lib/auth";
import { useSettings } from "../lib/settings";

type Mode = "signin" | "signup" | "verifyCode" | "mfa";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp, verifySignupCode, resendSignupCode, verifyMfaCode } = useAuth();
  const { t } = useSettings();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setError(null);
    setInfo(null);
    setCode("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    reset();
    try {
      if (mode === "signup") {
        const { error, needsConfirmation } = await signUp(email.trim(), password);
        if (error) setError(error);
        else if (needsConfirmation) {
          // A 6-digit code was emailed to the address they signed up with.
          setInfo(t("auth.codeSent"));
          setMode("verifyCode");
        } else onClose();
      } else if (mode === "verifyCode") {
        const { error } = await verifySignupCode(email.trim(), code);
        if (error) setError(error);
        else onClose();
      } else if (mode === "mfa") {
        const { error } = await verifyMfaCode(code);
        if (error) setError(error);
        else onClose();
      } else {
        const { error, mfaNeeded } = await signIn(email.trim(), password);
        if (error) setError(error);
        else if (mfaNeeded) {
          setInfo(t("auth.mfaPrompt"));
          setMode("mfa");
        } else onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    reset();
    const { error } = await resendSignupCode(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setInfo(t("auth.codeResent"));
  };

  const showCodeForm = mode === "verifyCode" || mode === "mfa";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("auth.title")}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-line/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-tight">
            {mode === "signin" && t("auth.signIn")}
            {mode === "signup" && t("auth.signUp")}
            {mode === "verifyCode" && t("auth.verifyCodeTitle")}
            {mode === "mfa" && t("auth.mfaTitle")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xl text-muted-foreground hover:bg-line/10"
            aria-label={t("auth.close")}
          >
            ×
          </button>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          {mode === "verifyCode" && t("auth.verifyCodeSubtitle")}
          {mode === "mfa" && t("auth.mfaSubtitle")}
          {(mode === "signin" || mode === "signup") && t("auth.subtitle")}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {!showCodeForm && (
            <>
              <div>
                <label htmlFor="auth-email" className="mb-1 block text-sm font-medium">
                  {t("auth.email")}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-background px-3 py-2.5 text-sm ring-1 ring-line/20 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="mb-1 block text-sm font-medium">
                  {t("auth.password")}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-background px-3 py-2.5 text-sm ring-1 ring-line/20 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {mode === "signup" && (
                  <p className="mt-1 text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
                )}
              </div>
            </>
          )}

          {showCodeForm && (
            <div>
              <label htmlFor="auth-code" className="mb-1 block text-sm font-medium">
                {mode === "verifyCode" ? t("auth.codeLabel") : t("auth.mfaCodeLabel")}
              </label>
              <input
                id="auth-code"
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                placeholder="123456"
                className="w-full rounded-lg bg-background px-3 py-2.5 text-center text-2xl font-semibold tracking-[0.3em] ring-1 ring-line/20 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {mode === "verifyCode" && (
                <button
                  type="button"
                  onClick={resend}
                  disabled={busy}
                  className="mt-2 text-xs font-medium text-accent hover:underline disabled:opacity-50"
                >
                  {t("auth.resendCode")}
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent" role="status">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy
              ? t("auth.working")
              : mode === "signin"
                ? t("auth.signIn")
                : mode === "signup"
                  ? t("auth.createAccount")
                  : t("auth.verify")}
          </button>
        </form>

        {!showCodeForm && (
          <div className="mt-4 text-center text-sm">
            {mode === "signin" ? (
              <p className="text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <button
                  onClick={() => { setMode("signup"); reset(); }}
                  className="font-semibold text-accent hover:underline"
                >
                  {t("auth.signUp")}
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                {t("auth.haveAccount")}{" "}
                <button
                  onClick={() => { setMode("signin"); reset(); }}
                  className="font-semibold text-accent hover:underline"
                >
                  {t("auth.signIn")}
                </button>
              </p>
            )}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">{t("auth.privacyNote")}</p>
      </div>
    </div>
  );
}

/** Setup flow for TOTP 2FA: scan QR with an authenticator app, then confirm with a code. */
export function MfaSetupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { enrollMfa, confirmMfaEnrollment } = useAuth();
  const { t } = useSettings();
  const [step, setStep] = useState<"loading" | "scan" | "done">("loading");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const start = async () => {
    setStep("loading");
    setError(null);
    const { error, qrCode, secret } = await enrollMfa();
    if (error) {
      setError(error);
      setStep("loading");
    } else {
      setQr(qrCode ?? "");
      setSecret(secret ?? "");
      setStep("scan");
    }
  };

  // Kick off enrollment when the modal opens
  if (step === "loading" && !busy && !error) {
    setBusy(true);
    start().finally(() => setBusy(false));
  }

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await confirmMfaEnrollment(code);
    setBusy(false);
    if (error) setError(error);
    else setStep("done");
  };

  const close = () => {
    setStep("loading");
    setCode("");
    setError(null);
    setQr("");
    setSecret("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={t("auth.mfaSetupTitle")}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-line/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-tight">{t("auth.mfaSetupTitle")}</h2>
          <button
            onClick={close}
            className="rounded-full px-2 py-1 text-xl text-muted-foreground hover:bg-line/10"
            aria-label={t("auth.close")}
          >
            ×
          </button>
        </div>

        {step === "loading" && !error && (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("auth.working")}</p>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {step === "scan" && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{t("auth.mfaScanHint")}</p>
            <div className="mx-auto mb-4 w-fit rounded-xl bg-white p-3">
              {qr ? <QRCodeSVG value={qr} size={180} /> : null}
            </div>
            {secret && (
              <p className="mb-4 break-all rounded-lg bg-background px-3 py-2 text-center font-mono text-xs text-muted-foreground">
                {secret}
              </p>
            )}
            <form onSubmit={confirm} className="space-y-3">
              <input
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                placeholder="123456"
                className="w-full rounded-lg bg-background px-3 py-2.5 text-center text-2xl font-semibold tracking-[0.3em] ring-1 ring-line/20 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? t("auth.working") : t("auth.mfaEnable")}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <p className="py-4 text-center text-sm text-accent" role="status">
              {t("auth.mfaEnabledMsg")}
            </p>
            <button
              onClick={close}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t("auth.close")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function AuthButton() {
  const { user, loading, signOut, mfaEnabled, mfaRequired, unenrollMfa, deleteMyData } = useAuth();
  const { t } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuMsg, setMenuMsg] = useState<string | null>(null);

  if (loading) return null;

  if (!user) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("auth.signIn")}
        </button>
        <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();

  const disableMfa = async () => {
    setBusy(true);
    setMenuMsg(null);
    const { error } = await unenrollMfa();
    setBusy(false);
    setMenuMsg(error ?? t("auth.mfaDisabledMsg"));
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    const { error } = await deleteMyData();
    setBusy(false);
    if (error) {
      setMenuMsg(error);
      setConfirmDelete(false);
    } else {
      setMenuMsg(t("auth.dataDeletedMsg"));
      setConfirmDelete(false);
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => { setMenuOpen((v) => !v); setMenuMsg(null); setConfirmDelete(false); }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground ring-2 ring-accent/30"
        aria-label={user.email ?? t("auth.account")}
        title={user.email ?? undefined}
      >
        {initial}
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl bg-surface p-3 shadow-xl ring-1 ring-line/10">
            <p className="truncate px-1 pb-1 text-xs text-muted-foreground">{user.email}</p>
            {mfaRequired && (
              <p className="mb-2 rounded-lg bg-amber-500/10 px-2 py-1.5 text-xs text-amber-600">
                {t("auth.mfaPendingWarn")}
              </p>
            )}

            <p className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("auth.security")}
            </p>
            {mfaEnabled ? (
              <button
                onClick={disableMfa}
                disabled={busy}
                className="w-full rounded-lg bg-line/10 px-3 py-2 text-left text-sm font-medium hover:bg-line/20 disabled:opacity-50"
              >
                {t("auth.mfaDisable")} ✓
              </button>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); setMfaSetupOpen(true); }}
                className="w-full rounded-lg bg-line/10 px-3 py-2 text-left text-sm font-medium hover:bg-line/20"
              >
                {t("auth.mfaEnable")}
              </button>
            )}

            <p className="px-1 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("auth.privacy")}
            </p>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="w-full rounded-lg bg-destructive/10 px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
            >
              {confirmDelete ? t("auth.deleteConfirm") : t("auth.deleteData")}
            </button>

            {menuMsg && (
              <p className="mt-2 rounded-lg bg-accent/10 px-2 py-1.5 text-xs text-accent" role="status">
                {menuMsg}
              </p>
            )}

            <div className="my-2 border-t border-line/10" />
            <button
              onClick={() => { setMenuOpen(false); signOut(); }}
              className="w-full rounded-lg bg-line/10 px-3 py-2 text-left text-sm font-medium hover:bg-line/20"
            >
              {t("auth.signOut")}
            </button>
          </div>
        </>
      )}
      <MfaSetupModal open={mfaSetupOpen} onClose={() => setMfaSetupOpen(false)} />
    </div>
  );
}

/** Dedicated blocking MFA prompt: if the session exists but MFA verification is
 * still pending (AAL1), force the MFA code screen until it is verified. */
export function MfaPrompt() {
  const { user, mfaRequired, loading, verifyMfaCode, signOut } = useAuth();
  const { t } = useSettings();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !user || !mfaRequired) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await verifyMfaCode(code);
    setBusy(false);
    if (error) setError(error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t("auth.mfaTitle")}>
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-line/10">
        <h2 className="mb-1 font-display text-2xl tracking-tight">{t("auth.mfaTitle")}</h2>
        <p className="mb-5 text-sm text-muted-foreground">{t("auth.mfaSubtitle")}</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            placeholder="123456"
            className="w-full rounded-lg bg-background px-3 py-2.5 text-center text-2xl font-semibold tracking-[0.3em] ring-1 ring-line/20 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? t("auth.working") : t("auth.verify")}
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full text-center text-xs text-muted-foreground hover:underline"
          >
            {t("auth.signOut")}
          </button>
        </form>
      </div>
    </div>
  );
}
