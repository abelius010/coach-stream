// Derived "work inbox" data for the coach dashboard.
// Pure functions over the student list so each block can be swapped for a
// Supabase query later without touching the UI components.
import type { StudentExt } from "./demo-store";

export type InboxView =
  | "home"
  | "activos"
  | "revisiones"
  | "videos"
  | "comidas"
  | "inactivos"
  | "peso";

// Deterministic pseudo-random so the demo looks stable between renders.
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
};

const daysAgoLabel = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};
const daysAheadLabel = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

export type PendingReview = {
  student: StudentExt;
  lastReview: string;
  nextReview: string;
  overdue: boolean;
};

export const pendingReviews = (students: StudentExt[]): PendingReview[] =>
  students
    .filter((s) => hash(s.id) % 5 < 2)
    .map((s) => {
      const h = hash(s.id);
      const since = 7 + (h % 14);
      const next = (h % 5) - 1; // -1 .. 3
      return {
        student: s,
        lastReview: daysAgoLabel(since),
        nextReview: next <= 0 ? "Hoy" : daysAheadLabel(next),
        overdue: next < 0,
      };
    });

export type PendingVideo = {
  id: string;
  student: StudentExt;
  exercise: string;
  uploadedAt: string;
  thumb: string;
};

const EXERCISES = [
  "Sentadilla trasera",
  "Peso muerto",
  "Press banca",
  "Dominadas",
  "Press militar",
  "Remo con barra",
  "Hip thrust",
  "Zancadas",
];

const VIDEO_THUMBS = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop",
];

export const pendingVideos = (students: StudentExt[]): PendingVideo[] =>
  students
    .filter((s) => hash(s.id) % 4 < 2)
    .map((s, i) => {
      const h = hash(s.id);
      return {
        id: `vid-${s.id}`,
        student: s,
        exercise: EXERCISES[h % EXERCISES.length]!,
        uploadedAt: h % 3 === 0 ? "Hoy · 08:24" : `${daysAgoLabel(1 + (h % 3))} · 19:${10 + (h % 40)}`,
        thumb: VIDEO_THUMBS[(h + i) % VIDEO_THUMBS.length]!,
      };
    });

export type MealPhoto = {
  id: string;
  student: StudentExt;
  mealType: string;
  photo: string;
  planned: string;
  at: string;
  comment?: string;
};

const MEAL_TYPES = ["Desayuno", "Media mañana", "Comida", "Merienda", "Cena", "Comida libre"];
const MEAL_PHOTOS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop",
];
const PLANNED = [
  "150 g pollo · 80 g arroz · ensalada",
  "4 claras · 60 g avena · 1 plátano",
  "200 g salmón · 250 g patata · verduras",
  "Yogur griego · 30 g nueces",
  "Tortilla francesa · 50 g pan integral",
];
const COMMENTS = [
  "He cambiado el arroz por quinoa, ¿está bien?",
  "Hoy tenía comida fuera, intenté ajustarlo.",
  undefined,
  "Me quedé con hambre, ¿subo un poco los hidratos?",
  undefined,
];

export const mealPhotos = (students: StudentExt[]): MealPhoto[] =>
  students.flatMap((s) => {
    const h = hash(s.id);
    if (h % 3 === 0) return [];
    const count = 1 + (h % 2);
    return Array.from({ length: count }, (_, i) => ({
      id: `meal-${s.id}-${i}`,
      student: s,
      mealType: MEAL_TYPES[(h + i) % MEAL_TYPES.length]!,
      photo: MEAL_PHOTOS[(h + i) % MEAL_PHOTOS.length]!,
      planned: PLANNED[(h + i) % PLANNED.length]!,
      at: `Hoy · ${String(8 + ((h + i * 5) % 12)).padStart(2, "0")}:${String((h * 7 + i * 13) % 60).padStart(2, "0")}`,
      comment: COMMENTS[(h + i) % COMMENTS.length],
    }));
  });

export type InactiveStudent = { student: StudentExt; days: number; lastActive: string };

export const inactiveStudents = (students: StudentExt[]): InactiveStudent[] =>
  students
    .filter((s) => s.status === "riesgo" || /d[ií]as/.test(s.lastActive))
    .map((s) => {
      const m = s.lastActive.match(/(\d+)/);
      const days = m ? Number(m[1]) : 3 + (hash(s.id) % 5);
      return { student: s, days, lastActive: s.lastActive };
    })
    .filter((r) => r.days >= 3)
    .sort((a, b) => b.days - a.days);

export type MissingWeight = { student: StudentExt; lastWeight: number; lastWeightDate: string };

export const missingWeights = (students: StudentExt[]): MissingWeight[] =>
  students
    .filter((s) => hash(s.id) % 3 === 1)
    .map((s) => ({
      student: s,
      lastWeight: s.weight,
      lastWeightDate: daysAgoLabel(7 + (hash(s.id) % 10)),
    }));
