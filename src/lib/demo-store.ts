import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { students as seedStudents, workoutWeeks as seedWorkoutWeeks, nutritionPlan as seedNutrition, type Student } from "./demo-data";

export type StudentExt = Student & {
  lastName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  sex?: "hombre" | "mujer" | "otro";
  bodyFat?: number;
  measurements?: { chest?: number; arm?: number; waist?: number; hip?: number; thigh?: number };
  secondaryGoal?: string;
  experience?: "principiante" | "intermedio" | "avanzado";
  daysPerWeek?: number;
  sessionMinutes?: number;
  equipment?: string[];
  preference?: string;
  injuries?: string;
  coachNotes?: string;
  nextReview?: string;
  createdAt?: string;
};

export type NewStudentInput = Omit<StudentExt, "id" | "avatar" | "compliance" | "lastActive" | "status"> & {
  avatar?: string;
  status?: Student["status"];
};

export type DemoRole = "coach" | "student";

export type WorkoutTemplate = { id: string; name: string; createdAt: string; summary: string };
export type NutritionTemplate = { id: string; name: string; createdAt: string; summary: string };

export type RoutineExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  note: string;
};
export type RoutineDay = { id: string; day: string; done?: boolean; exercises: RoutineExercise[] };
export type RoutineWeek = { id: string; week: string; days: RoutineDay[] };

export type NutritionItem = { id: string; name: string; qty: string; unit: string };
export type NutritionMeal = {
  id: string;
  name: string;
  time?: string;
  photo?: string | null;
  notes: string;
  items: NutritionItem[];
};
export type NutritionPlanData = {
  targets: { kcal: number; protein: number; carbs: number; fat: number };
  meals: NutritionMeal[];
  coachNote: string;
};

export type WeightLog = { id: string; date: string; kg: number };
export type ReviewMeasurements = {
  chest?: number;
  arm?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
};
export type Review = {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  measurements?: ReviewMeasurements;
  notes?: string;
  photos?: string[];
};
export type MediaFile = {
  id: string;
  name: string;
  url: string;
  kind: "image" | "video" | "file";
  uploadedAt: string;
};
export type ChatMsg = { id: string; from: "coach" | "student"; text: string; time: string };

export const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const parseSets = (s: string): { sets: string; reps: string } => {
  const m = /^\s*(\d+)\s*[x×]\s*(.+?)\s*$/i.exec(s);
  if (m) return { sets: m[1], reps: m[2] };
  return { sets: s, reps: "" };
};

export const seedRoutine = (): RoutineWeek[] =>
  seedWorkoutWeeks.map((w) => ({
    id: genId("wk"),
    week: w.week,
    days: w.days.map((d) => ({
      id: genId("day"),
      day: d.day,
      done: d.done,
      exercises: d.exercises.map((e) => {
        const { sets, reps } = parseSets(e.sets);
        return { id: genId("ex"), name: e.name, sets, reps, weight: e.weight, note: e.note };
      }),
    })),
  }));

const parseItem = (s: string): { name: string; qty: string; unit: string } => {
  const m = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)?\s*$/.exec(s);
  if (m) return { name: m[1].trim(), qty: m[2].replace(",", "."), unit: (m[3] ?? "").trim() };
  return { name: s, qty: "", unit: "" };
};

export const seedNutritionPlan = (): NutritionPlanData => ({
  targets: { ...seedNutrition.targets },
  coachNote: seedNutrition.coachNote,
  meals: seedNutrition.meals.map((m) => ({
    id: genId("meal"),
    name: m.name,
    time: m.time,
    photo: m.photo,
    notes: "",
    items: m.items.map((it) => ({ id: genId("it"), ...parseItem(it) })),
  })),
});

export const starterRoutine = (): RoutineWeek[] => [
  {
    id: genId("wk"),
    week: "Semana 1",
    days: [{ id: genId("day"), day: "Día 1", exercises: [] }],
  },
];

export const starterNutritionPlan = (): NutritionPlanData => ({
  targets: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  coachNote: "",
  meals: [
    { id: genId("meal"), name: "Desayuno", time: "", photo: null, notes: "", items: [] },
  ],
});

type State = {
  students: StudentExt[];
  role: DemoRole;
  workoutTemplates: WorkoutTemplate[];
  nutritionTemplates: NutritionTemplate[];
  routines: Record<string, RoutineWeek[]>;
  nutritionPlans: Record<string, NutritionPlanData>;
  weightLogs: Record<string, WeightLog[]>;
  reviews: Record<string, Review[]>;
  habitsConfigured: Record<string, boolean>;
  media: Record<string, MediaFile[]>;
  messages: Record<string, ChatMsg[]>;
  setRole: (r: DemoRole) => void;
  addWorkoutTemplate: (t: Omit<WorkoutTemplate, "id" | "createdAt">) => void;
  addNutritionTemplate: (t: Omit<NutritionTemplate, "id" | "createdAt">) => void;
  addStudent: (input: NewStudentInput) => string;
  updateStudent: (id: string, patch: Partial<StudentExt>) => void;
  removeStudent: (id: string) => void;
  setRoutine: (studentId: string, weeks: RoutineWeek[]) => void;
  setNutritionPlan: (studentId: string, plan: NutritionPlanData) => void;
  addReview: (studentId: string, review: Omit<Review, "id">) => void;
  removeReview: (studentId: string, reviewId: string) => void;
  configureHabits: (studentId: string) => void;
  addMedia: (studentId: string, file: Omit<MediaFile, "id" | "uploadedAt">) => void;
  removeMedia: (studentId: string, fileId: string) => void;
  sendMessage: (studentId: string, msg: Omit<ChatMsg, "id" | "time">) => void;
  resetDemo: () => void;
};

const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const uniqueId = (base: string, existing: string[]) => {
  let id = base || `alumno-${Date.now()}`;
  let n = 2;
  while (existing.includes(id)) id = `${base}-${n++}`;
  return id;
};

export const useDemoStore = create<State>()(
  persist(
    (set, get) => ({
      students: seedStudents as StudentExt[],
      role: "coach" as DemoRole,
      workoutTemplates: [
        { id: "wt-fullbody-3d", name: "Full Body 3 días", createdAt: "hace 2 sem", summary: "Rutina base para principiantes · 3 sesiones/semana" },
        { id: "wt-ppl-5d", name: "Push · Pull · Legs (5 días)", createdAt: "hace 1 mes", summary: "Split clásico para intermedios · foco hipertrofia" },
        { id: "wt-upper-lower", name: "Upper / Lower 4 días", createdAt: "hace 3 días", summary: "Volumen equilibrado · 4 sesiones/semana" },
      ],
      nutritionTemplates: [
        { id: "nt-deficit-1800", name: "Déficit moderado 1.800 kcal", createdAt: "hace 1 sem", summary: "40/30/30 · pérdida de grasa controlada" },
        { id: "nt-maint-2400", name: "Mantenimiento 2.400 kcal", createdAt: "hace 2 sem", summary: "Balance macros para recomposición" },
        { id: "nt-bulk-2900", name: "Volumen limpio 2.900 kcal", createdAt: "hace 1 mes", summary: "Superávit ligero · alta proteína" },
      ],
      routines: {},
      nutritionPlans: {},
      weightLogs: {},
      reviews: {},
      habitsConfigured: {},
      media: {},
      messages: {},
      setRole: (r) => set({ role: r }),
      addWorkoutTemplate: (t) =>
        set({
          workoutTemplates: [
            { id: `wt-${Date.now()}`, createdAt: "ahora", ...t },
            ...get().workoutTemplates,
          ],
        }),
      addNutritionTemplate: (t) =>
        set({
          nutritionTemplates: [
            { id: `nt-${Date.now()}`, createdAt: "ahora", ...t },
            ...get().nutritionTemplates,
          ],
        }),
      addStudent: (input) => {
        const state = get();
        const base = slug(`${input.name} ${input.lastName ?? ""}`.trim());
        const id = uniqueId(base, state.students.map((s) => s.id));
        const now = new Date().toISOString();
        const student: StudentExt = {
          id,
          name: `${input.name}${input.lastName ? " " + input.lastName : ""}`.trim(),
          avatar: input.avatar || `https://i.pravatar.cc/160?u=${id}`,
          goal: input.goal || "Sin objetivo",
          weight: input.weight ?? 0,
          weightStart: input.weightStart ?? input.weight ?? 0,
          weightGoal: input.weightGoal ?? input.weight ?? 0,
          status: input.status ?? "activo",
          lastActive: "Recién creado",
          compliance: 0,
          startDate: input.startDate || new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
          height: input.height ?? 0,
          age: input.age ?? 0,
          plan: input.plan || "Sin plan asignado",
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          birthDate: input.birthDate,
          sex: input.sex,
          bodyFat: input.bodyFat,
          measurements: input.measurements,
          secondaryGoal: input.secondaryGoal,
          experience: input.experience,
          daysPerWeek: input.daysPerWeek,
          sessionMinutes: input.sessionMinutes,
          equipment: input.equipment,
          preference: input.preference,
          injuries: input.injuries,
          coachNotes: input.coachNotes,
          createdAt: now,
        };
        set({ students: [student, ...state.students] });
        return id;
      },
      updateStudent: (id, patch) =>
        set({
          students: get().students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),
      removeStudent: (id) => {
        const s = get();
        const omit = <T,>(r: Record<string, T>) => {
          const { [id]: _drop, ...rest } = r;
          return rest;
        };
        set({
          students: s.students.filter((x) => x.id !== id),
          routines: omit(s.routines),
          nutritionPlans: omit(s.nutritionPlans),
          weightLogs: omit(s.weightLogs),
          reviews: omit(s.reviews),
          habitsConfigured: omit(s.habitsConfigured),
          media: omit(s.media),
          messages: omit(s.messages),
        });
      },
      setRoutine: (studentId, weeks) =>
        set({ routines: { ...get().routines, [studentId]: weeks } }),
      setNutritionPlan: (studentId, plan) =>
        set({ nutritionPlans: { ...get().nutritionPlans, [studentId]: plan } }),
      addReview: (studentId, review) => {
        const state = get();
        const newReview: Review = { id: genId("rev"), ...review };
        const list = [...(state.reviews[studentId] ?? []), newReview].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
        const patch: Partial<State> = { reviews: { ...state.reviews, [studentId]: list } };
        if (typeof review.weight === "number" && !Number.isNaN(review.weight)) {
          const logs = [
            ...(state.weightLogs[studentId] ?? []),
            { id: genId("wl"), date: review.date, kg: review.weight },
          ].sort((a, b) => a.date.localeCompare(b.date));
          patch.weightLogs = { ...state.weightLogs, [studentId]: logs };
          patch.students = state.students.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  weight: review.weight!,
                  bodyFat: review.bodyFat ?? s.bodyFat,
                  measurements: { ...(s.measurements ?? {}), ...(review.measurements ?? {}) },
                }
              : s,
          );
        }
        set(patch as State);
      },
      removeReview: (studentId, reviewId) => {
        const state = get();
        const target = (state.reviews[studentId] ?? []).find((r) => r.id === reviewId);
        const list = (state.reviews[studentId] ?? []).filter((r) => r.id !== reviewId);
        const patch: Partial<State> = { reviews: { ...state.reviews, [studentId]: list } };
        if (target) {
          const logs = (state.weightLogs[studentId] ?? []).filter(
            (l) => !(l.date === target.date && l.kg === target.weight),
          );
          patch.weightLogs = { ...state.weightLogs, [studentId]: logs };
        }
        set(patch as State);
      },
      configureHabits: (studentId) =>
        set({ habitsConfigured: { ...get().habitsConfigured, [studentId]: true } }),
      addMedia: (studentId, file) => {
        const state = get();
        const list = [
          { id: genId("mf"), uploadedAt: new Date().toISOString(), ...file },
          ...(state.media[studentId] ?? []),
        ];
        set({ media: { ...state.media, [studentId]: list } });
      },
      removeMedia: (studentId, fileId) => {
        const state = get();
        const list = (state.media[studentId] ?? []).filter((f) => f.id !== fileId);
        set({ media: { ...state.media, [studentId]: list } });
      },
      sendMessage: (studentId, msg) => {
        const state = get();
        const time = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
        const list = [...(state.messages[studentId] ?? []), { id: genId("msg"), time, ...msg }];
        set({ messages: { ...state.messages, [studentId]: list } });
      },
      resetDemo: () =>
        set({
          students: seedStudents as StudentExt[],
          routines: {},
          nutritionPlans: {},
          weightLogs: {},
          reviews: {},
          habitsConfigured: {},
          media: {},
          messages: {},
        }),
    }),
    {
      name: "fitflow-demo",
      version: 3,
      migrate: (persisted: unknown, _v: number) => persisted as State,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const isNewStudent = (s?: StudentExt | null) => !!s?.createdAt;

export const useHydratedStudents = () => useDemoStore((s) => s.students);
