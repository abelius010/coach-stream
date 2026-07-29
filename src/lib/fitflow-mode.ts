import { useSyncExternalStore } from "react";

export type FitFlowMode = "demo" | "account";

const KEY = "fitflow-mode";
const PROFILE_KEY = "fitflow-account-profile";

const listeners = new Set<() => void>();

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

export const setAccountProfile = (p: AccountProfile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
};

export const clearAccountProfile = () => {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {}
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
