import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { resetAccountStore } from "./demo-store";

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

export const signOutTrainer = async (): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth] Error al cerrar sesión:", error.message);
    return { error: "No se pudo cerrar sesión correctamente." };
  }
  return { error: null };
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
// Única suscripción a onAuthStateChange en toda la app.
export const useAuthUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      lastUserId.current = sessionUser?.id ?? null;
      setUser(sessionUser);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;

      // Si el usuario autenticado ha cambiado (login con otra cuenta, o
      // sesión cerrada), limpia inmediatamente cualquier dato local de la
      // cuenta anterior antes de que el resto de la app vuelva a pintar.
      if (sessionUser?.id !== lastUserId.current) {
        resetAccountStore();
      }
      lastUserId.current = sessionUser?.id ?? null;

      setUser(sessionUser);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
