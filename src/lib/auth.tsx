import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";
import type { User, Session, Factor } from "@supabase/supabase-js";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** true when the signed-in session still needs an MFA code (AAL1 -> AAL2) */
  mfaRequired: boolean;
  /** true when the user has an enrolled, verified TOTP factor */
  mfaEnabled: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  /** Verify the 6-digit code emailed after signup (type 'signup'). */
  verifySignupCode: (email: string, code: string) => Promise<{ error: string | null }>;
  /** Resend the signup confirmation code. */
  resendSignupCode: (email: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; mfaNeeded: boolean }>;
  /** Verify the MFA (authenticator app) code after password login. */
  verifyMfaCode: (code: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Start TOTP enrollment. Returns QR data + secret to show the user. */
  enrollMfa: () => Promise<{ error: string | null; qrCode?: string; secret?: string; uri?: string }>;
  /** Confirm enrollment with a code from the authenticator app. */
  confirmMfaEnrollment: (code: string) => Promise<{ error: string | null }>;
  /** Remove the enrolled TOTP factor. */
  unenrollMfa: () => Promise<{ error: string | null }>;
  /** Refresh the enrolled-factors state. */
  refreshMfaFactors: () => Promise<void>;
  /** Delete the user's own profile + progress rows (GDPR-style self delete). */
  deleteMyData: () => Promise<{ error: string | null }>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<Factor[]>([]);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);

  const mfaEnabled = mfaFactors.some((f) => f.status === "verified" && f.factor_type === "totp");

  const checkMfaState = useCallback(async (sess: Session | null) => {
    if (!sess?.user) {
      setMfaRequired(false);
      setMfaFactors([]);
      return;
    }
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totp = factorsData?.totp ?? [];
      setMfaFactors(totp);
      const hasVerified = totp.some((f) => f.status === "verified");
      if (hasVerified) {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        // If the next level is aal2 but we are only at aal1, an MFA code is still needed.
        setMfaRequired(aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2");
      } else {
        setMfaRequired(false);
      }
    } catch {
      setMfaRequired(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      checkMfaState(data.session).finally(() => setLoading(false));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      checkMfaState(sess);
    });

    return () => subscription.unsubscribe();
  }, [checkMfaState]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message, needsConfirmation: false };
    // Email confirmation ON -> no session yet; the code goes to the user's Gmail.
    return { error: null, needsConfirmation: !data.session };
  };

  const verifySignupCode = async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "signup" });
    return { error: error?.message ?? null };
  };

  const resendSignupCode = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, mfaNeeded: false };
    // Password OK — check whether this account has 2FA enrolled.
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verified = (factorsData?.totp ?? []).some((f) => f.status === "verified");
      if (verified) {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        const needed = aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2";
        setMfaRequired(needed);
        setMfaFactors(factorsData?.totp ?? []);
        return { error: null, mfaNeeded: needed };
      }
    } catch {
      // fall through — treat as no MFA
    }
    return { error: null, mfaNeeded: false };
  };

  const verifyMfaCode = async (code: string) => {
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const factor = (factorsData?.totp ?? []).find((f) => f.status === "verified");
      if (!factor) return { error: "No 2FA method found for this account." };
      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (chErr) return { error: chErr.message };
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (vErr) return { error: vErr.message };
      setMfaRequired(false);
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Verification failed." };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMfaRequired(false);
    setMfaFactors([]);
    setPendingFactorId(null);
  };

  const enrollMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Citizen Prep 2FA",
    });
    if (error) return { error: error.message };
    setPendingFactorId(data.id);
    return { error: null, qrCode: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri };
  };

  const confirmMfaEnrollment = async (code: string) => {
    if (!pendingFactorId) return { error: "No pending 2FA setup. Start again." };
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: pendingFactorId,
      code: code.trim(),
    });
    if (error) return { error: error.message };
    setPendingFactorId(null);
    await refreshMfaFactors();
    return { error: null };
  };

  const unenrollMfa = async () => {
    const factor = mfaFactors.find((f) => f.status === "verified" && f.factor_type === "totp");
    if (!factor) return { error: "No 2FA method to remove." };
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) return { error: error.message };
    await refreshMfaFactors();
    return { error: null };
  };

  const refreshMfaFactors = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      setMfaFactors(data?.totp ?? []);
    } catch {
      /* ignore */
    }
  };

  const deleteMyData = async () => {
    if (!user) return { error: "Not signed in." };
    const uid = user.id;
    // Delete progress rows, then profile row. RLS guarantees users can only
    // touch their own rows; service-role/admin access is outside this path.
    const { error: pErr } = await supabase.from("user_progress").delete().eq("user_id", uid);
    if (pErr) return { error: pErr.message };
    const { error: prErr } = await supabase.from("profiles").delete().eq("id", uid);
    if (prErr) return { error: prErr.message };
    return { error: null };
  };

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        loading,
        mfaRequired,
        mfaEnabled,
        signUp,
        verifySignupCode,
        resendSignupCode,
        signIn,
        verifyMfaCode,
        signOut,
        enrollMfa,
        confirmMfaEnrollment,
        unenrollMfa,
        refreshMfaFactors,
        deleteMyData,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
