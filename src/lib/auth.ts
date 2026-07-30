import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AuthResult = { user: User | null; error: string | null };

export const signUpTrainer = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { user: null, error: mapAuthError(error.message) };
    return { user: data.user, error: null };
  } catch (err) {
    console.error("[auth] Error de red al registrarse:", err);
    return { user: null, error: "No se ha podido conectar con Supabase." };
  }
};

export const signInTrainer = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: mapAuthError(error.message) };
    return { user: data.user, error: null };
  } catch (err) {
    console.error("[auth] Error de red al iniciar sesión:", err);
    return { user: null, error: "No se ha podido conectar con Supabase." };
  }
};

export const signOutTrainer = async (): Promise<void> => {
  await supabase.auth.signOut();
};

const mapAuthError = (message: string): string => {
  if (/already registered/i.test(message)) return "Ese correo ya tiene una cuenta. Prueba a iniciar sesión.";
  if (/invalid login credentials/i.test(message)) return "Email o contraseña incorrectos.";
  if (/email not confirmed/i.test(message)) return "Debes confirmar tu correo antes de iniciar sesión.";
  if (/password should be/i.test(message)) return "La contraseña es demasiado corta (mínimo 6 caracteres).";
  console.error("[auth] Error técnico de Supabase:", message);
  return "No se ha podido conectar con Supabase.";
};

// Hook: expone el usuario autenticado actual y si todavía se está
// comprobando la sesión inicial (para no redirigir de más mientras carga).
export const useAuthUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
