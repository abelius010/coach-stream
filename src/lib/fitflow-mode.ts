import { useSyncExternalStore } from "react";

export type FitFlowMode = "demo" | "account";

const KEY = "fitflow-mode";
const PROFILE_KEY = "fitflow-account-profile";
const ACTIVE_ALUMNO_KEY = "fitflow-active-alumno";

const listeners = new Set<() => void>();
const alumnoListeners = new Set<() => void>();

const readActiveAlumnoId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_ALUMNO_KEY);
  } catch {
    return null;
  }
};

let cachedAlumnoId: string | null = readActiveAlumnoId();

export const getActiveAlumnoId = (): string | null => cachedAlumnoId;

export const setActiveAlumnoId = (id: string | null) => {
  cachedAlumnoId = id;
  try {
    if (id) localStorage.setItem(ACTIVE_ALUMNO_KEY, id);
    else localStorage.removeItem(ACTIVE_ALUMNO_KEY);
  } catch {}
  alumnoListeners.forEach((l) => l());
};

const subscribeAlumno = (cb: () => void) => {
  alumnoListeners.add(cb);
  return () => {
    alumnoListeners.delete(cb);
  };
};

export const useActiveAlumnoId = (): string | null =>
  useSyncExternalStore(subscribeAlumno, getActiveAlumnoId, () => null);


const readMode = (): FitFlowMode => {
  if (typeof window === "undefined") return "demo";
  try {
    const v = localStorage.getItem(KEY);
    return v === "account" ? "account" : "demo";
  } catch {
    return "demo";
  }
};

let cached: FitFlowMode = readMode();

export const getMode = (): FitFlowMode => cached;

export const setMode = (m: FitFlowMode) => {
  cached = m;
  try {
    localStorage.setItem(KEY, m);
  } catch {}
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useMode = (): FitFlowMode =>
  useSyncExternalStore(subscribe, getMode, () => "demo");

export type AccountProfile = {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  professionalType?: string;
  workMode?: string;
  studentsRange?: string;
  currentTools?: string[];
  plan?: string;
};

export const getAccountProfile = (): AccountProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as AccountProfile) : null;
  } catch {
    return null;
  }
};

const profileListeners = new Set<() => void>();

const subscribeProfile = (cb: () => void) => {
  profileListeners.add(cb);
  return () => {
    profileListeners.delete(cb);
  };
};

// Hook seguro para SSR (mismo patrón que useMode): en el servidor y en la
// primera pintada del navegador siempre devuelve null, evitando el
// desajuste de hidratación que producía leer localStorage directamente.
export const useAccountProfile = (): AccountProfile | null =>
  useSyncExternalStore(subscribeProfile, getAccountProfile, () => null);

export const setAccountProfile = (p: AccountProfile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
  profileListeners.forEach((l) => l());
};

export const clearAccountProfile = () => {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {}
  profileListeners.forEach((l) => l());
};

export const displayName = (p: AccountProfile | null): string => {
  if (!p) return "Entrenador";
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Entrenador";
};

export const initials = (p: AccountProfile | null): string => {
  const n = displayName(p);
  return n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "E";
};

export const getPlanLimit = (plan?: string): number | null => {
  if (plan === "pro") return 75;
  if (plan === "business") return null;
  return 5; // gratuito (default)
};

export const planLabel = (plan?: string): string => {
  if (plan === "pro") return "Pro";
  if (plan === "business") return "Business";
  return "Gratuito";
};
