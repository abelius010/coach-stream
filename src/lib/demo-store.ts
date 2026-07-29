import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { students as seedStudents, workoutWeeks as seedWorkoutWeeks, nutritionPlan as seedNutrition, type Student } from "./demo-data";
import { getMode } from "./fitflow-mode";

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
export type NutritionDay = { id: string; day: string; meals: NutritionMeal[] };
export type NutritionWeek = { id: string; name: string; days: NutritionDay[] };
export type NutritionPlanData = {
  name?: string;
  objective?: string;
  startDate?: string;
  notes?: string;
  status?: "draft" | "active";
  targets: { kcal: number; protein: number; carbs: number; fat: number };
  meals: NutritionMeal[];
  weeks?: NutritionWeek[];
  coachNote: string;
};

export const WEEKDAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

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

export type SetProgress = { done: boolean; weight?: string };
export type ExerciseProgress = {
  sets: SetProgress[];
  weightUsed?: string;
  note?: string;
  done?: boolean;
};
export type DayProgress = {
  exercises: Record<string, ExerciseProgress>;
  finishedAt?: string;
};
export type WorkoutProgress = Record<string, DayProgress>;

export type MealLog = {
  photo?: string | null;
  photoAt?: string;
  done?: boolean;
  note?: string;
};
// Keyed by mealId (plan-level) so the same plan meal aggregates today's log.
export type NutritionProgress = Record<string, MealLog>;

export type ExtraMeal = {
  id: string;
  name: string;
  time: string;
  photo?: string | null;
  note?: string;
  createdAt: string;
};

export type HabitLog = {
  waterMl?: number;
  sleepHours?: number;
  sleepMinutes?: number;
  steps?: number;
  weight?: number;
  updatedAt?: string;
};

export type NutritionDaySnapshot = {
  date: string;
  closedAt: string;
  progress: NutritionProgress;
  extras: ExtraMeal[];
  habits: HabitLog;
};

export const todayKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const formatDateKey = (key: string): string => {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  const s = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const parseSetsCount = (sets: string): number => {
  const n = parseInt(sets, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 12) : 1;
};

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

export const starterNutritionWeek = (name: string): NutritionWeek => ({
  id: genId("nwk"),
  name,
  days: WEEKDAYS.map((d) => ({ id: genId("nday"), day: d, meals: [] })),
});

export const starterNutritionPlan = (): NutritionPlanData => ({
  name: "",
  objective: "",
  startDate: "",
  notes: "",
  status: "draft",
  targets: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  coachNote: "",
  meals: [
    { id: genId("meal"), name: "Desayuno", time: "", photo: null, notes: "", items: [] },
  ],
  weeks: [starterNutritionWeek("Semana 1")],
});

// Given a plan with weeks, return the meals for today's weekday from week 1
// (Monday = 0). Used to keep the student's "today" view consistent with the
// weekly builder.
export const mealsForToday = (plan: NutritionPlanData): NutritionMeal[] => {
  if (!plan.weeks || plan.weeks.length === 0) return plan.meals;
  const jsDay = new Date().getDay(); // 0=Sun..6=Sat
  const idx = (jsDay + 6) % 7; // 0=Mon..6=Sun
  return plan.weeks[0].days[idx]?.meals ?? [];
};

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
  workoutProgress: Record<string, WorkoutProgress>;
  nutritionProgress: Record<string, NutritionProgress>;
  nutritionExtras: Record<string, ExtraMeal[]>;
  nutritionDayIndex: Record<string, number>;
  habitsLog: Record<string, HabitLog>;
  nutritionHistory: Record<string, Record<string, NutritionDaySnapshot>>;
  coachMealComments: Record<string, Record<string, Record<string, string>>>;
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
  toggleSet: (studentId: string, dayId: string, exerciseId: string, setIndex: number, totalSets: number) => void;
  setExerciseWeight: (studentId: string, dayId: string, exerciseId: string, weight: string) => void;
  setExerciseNote: (studentId: string, dayId: string, exerciseId: string, note: string) => void;
  finishDay: (studentId: string, dayId: string) => void;
  resetDayProgress: (studentId: string, dayId: string) => void;
  setMealPhoto: (studentId: string, mealId: string, photo: string | null) => void;
  toggleMealDone: (studentId: string, mealId: string) => void;
  setMealNote: (studentId: string, mealId: string, note: string) => void;
  addExtraMeal: (studentId: string, meal: Omit<ExtraMeal, "id" | "createdAt">) => void;
  updateExtraMeal: (studentId: string, mealId: string, patch: Partial<ExtraMeal>) => void;
  removeExtraMeal: (studentId: string, mealId: string) => void;
  finishNutritionDay: (studentId: string) => void;
  updateHabit: (studentId: string, patch: Partial<HabitLog>) => void;
  setCoachMealComment: (studentId: string, dateKey: string, mealId: string, comment: string) => void;
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

type Seed = {
  students: StudentExt[];
  workoutTemplates: WorkoutTemplate[];
  nutritionTemplates: NutritionTemplate[];
};

const DEMO_SEED: Seed = {
  students: seedStudents as StudentExt[],
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
};

const EMPTY_SEED: Seed = {
  students: [],
  workoutTemplates: [],
  nutritionTemplates: [],
};

const createFitFlowStore = (persistName: string, seed: Seed) =>
  create<State>()(
    persist(
      (set, get) => ({
        students: seed.students,
        role: "coach" as DemoRole,
        workoutTemplates: seed.workoutTemplates,
        nutritionTemplates: seed.nutritionTemplates,
        routines: {},
        nutritionPlans: {},
        weightLogs: {},
        reviews: {},
        habitsConfigured: {},
        media: {},
        messages: {},
        workoutProgress: {},
        nutritionProgress: {},
        nutritionExtras: {},
        nutritionDayIndex: {},
        habitsLog: {},
        nutritionHistory: {},
        coachMealComments: {},
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
            workoutProgress: omit(s.workoutProgress),
            nutritionProgress: omit(s.nutritionProgress),
            nutritionExtras: omit(s.nutritionExtras),
            nutritionDayIndex: omit(s.nutritionDayIndex),
            habitsLog: omit(s.habitsLog),
            nutritionHistory: omit(s.nutritionHistory),
            coachMealComments: omit(s.coachMealComments),
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
        toggleSet: (studentId, dayId, exerciseId, setIndex, totalSets) => {
          const state = get();
          const prog = state.workoutProgress[studentId] ?? {};
          const day = prog[dayId] ?? { exercises: {} };
          const ex = day.exercises[exerciseId] ?? { sets: [] };
          const sets: SetProgress[] = Array.from({ length: totalSets }, (_, i) =>
            ex.sets[i] ?? { done: false },
          );
          sets[setIndex] = { ...sets[setIndex], done: !sets[setIndex].done };
          const done = sets.every((s) => s.done);
          const nextEx: ExerciseProgress = { ...ex, sets, done };
          const nextDay: DayProgress = {
            ...day,
            exercises: { ...day.exercises, [exerciseId]: nextEx },
          };
          set({
            workoutProgress: {
              ...state.workoutProgress,
              [studentId]: { ...prog, [dayId]: nextDay },
            },
          });
        },
        setExerciseWeight: (studentId, dayId, exerciseId, weight) => {
          const state = get();
          const prog = state.workoutProgress[studentId] ?? {};
          const day = prog[dayId] ?? { exercises: {} };
          const ex = day.exercises[exerciseId] ?? { sets: [] };
          const nextDay: DayProgress = {
            ...day,
            exercises: { ...day.exercises, [exerciseId]: { ...ex, weightUsed: weight } },
          };
          set({
            workoutProgress: {
              ...state.workoutProgress,
              [studentId]: { ...prog, [dayId]: nextDay },
            },
          });
        },
        setExerciseNote: (studentId, dayId, exerciseId, note) => {
          const state = get();
          const prog = state.workoutProgress[studentId] ?? {};
          const day = prog[dayId] ?? { exercises: {} };
          const ex = day.exercises[exerciseId] ?? { sets: [] };
          const nextDay: DayProgress = {
            ...day,
            exercises: { ...day.exercises, [exerciseId]: { ...ex, note } },
          };
          set({
            workoutProgress: {
              ...state.workoutProgress,
              [studentId]: { ...prog, [dayId]: nextDay },
            },
          });
        },
        finishDay: (studentId, dayId) => {
          const state = get();
          const prog = state.workoutProgress[studentId] ?? {};
          const day = prog[dayId] ?? { exercises: {} };
          const nextDay: DayProgress = { ...day, finishedAt: new Date().toISOString() };
          // Also mark the routine day as done so the coach view reflects it.
          const routines = { ...state.routines };
          const weeks = routines[studentId];
          if (weeks) {
            routines[studentId] = weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => (d.id === dayId ? { ...d, done: true } : d)),
            }));
          }
          set({
            routines,
            workoutProgress: {
              ...state.workoutProgress,
              [studentId]: { ...prog, [dayId]: nextDay },
            },
          });
        },
        resetDayProgress: (studentId, dayId) => {
          const state = get();
          const prog = { ...(state.workoutProgress[studentId] ?? {}) };
          delete prog[dayId];
          const routines = { ...state.routines };
          const weeks = routines[studentId];
          if (weeks) {
            routines[studentId] = weeks.map((w) => ({
              ...w,
              days: w.days.map((d) => (d.id === dayId ? { ...d, done: false } : d)),
            }));
          }
          set({
            routines,
            workoutProgress: { ...state.workoutProgress, [studentId]: prog },
          });
        },
        setMealPhoto: (studentId, mealId, photo) => {
          const state = get();
          const s = state.nutritionProgress[studentId] ?? {};
          const meal = s[mealId] ?? {};
          set({
            nutritionProgress: {
              ...state.nutritionProgress,
              [studentId]: {
                ...s,
                [mealId]: {
                  ...meal,
                  photo,
                  photoAt: photo ? new Date().toISOString() : undefined,
                  done: photo ? true : meal.done,
                },
              },
            },
          });
        },
        toggleMealDone: (studentId, mealId) => {
          const state = get();
          const s = state.nutritionProgress[studentId] ?? {};
          const meal = s[mealId] ?? {};
          set({
            nutritionProgress: {
              ...state.nutritionProgress,
              [studentId]: { ...s, [mealId]: { ...meal, done: !meal.done } },
            },
          });
        },
        setMealNote: (studentId, mealId, note) => {
          const state = get();
          const s = state.nutritionProgress[studentId] ?? {};
          const meal = s[mealId] ?? {};
          set({
            nutritionProgress: {
              ...state.nutritionProgress,
              [studentId]: { ...s, [mealId]: { ...meal, note } },
            },
          });
        },
        addExtraMeal: (studentId, meal) => {
          const state = get();
          const list = state.nutritionExtras[studentId] ?? [];
          const extra: ExtraMeal = {
            id: genId("xmeal"),
            createdAt: new Date().toISOString(),
            ...meal,
          };
          set({
            nutritionExtras: { ...state.nutritionExtras, [studentId]: [...list, extra] },
          });
        },
        updateExtraMeal: (studentId, mealId, patch) => {
          const state = get();
          const list = (state.nutritionExtras[studentId] ?? []).map((m) =>
            m.id === mealId ? { ...m, ...patch } : m,
          );
          set({ nutritionExtras: { ...state.nutritionExtras, [studentId]: list } });
        },
        removeExtraMeal: (studentId, mealId) => {
          const state = get();
          const list = (state.nutritionExtras[studentId] ?? []).filter((m) => m.id !== mealId);
          set({ nutritionExtras: { ...state.nutritionExtras, [studentId]: list } });
        },
        finishNutritionDay: (studentId) => {
          const state = get();
          const idx = (state.nutritionDayIndex[studentId] ?? 1) + 1;
          const dateKey = todayKey();
          const progress = state.nutritionProgress[studentId] ?? {};
          const extras = state.nutritionExtras[studentId] ?? [];
          const habits = state.habitsLog[studentId] ?? {};
          const hasAny =
            Object.keys(progress).length > 0 ||
            extras.length > 0 ||
            Object.keys(habits).length > 0;
          const historyForStudent = { ...(state.nutritionHistory[studentId] ?? {}) };
          if (hasAny) {
            historyForStudent[dateKey] = {
              date: dateKey,
              closedAt: new Date().toISOString(),
              progress,
              extras,
              habits,
            };
          }
          set({
            nutritionProgress: { ...state.nutritionProgress, [studentId]: {} },
            nutritionExtras: { ...state.nutritionExtras, [studentId]: [] },
            habitsLog: { ...state.habitsLog, [studentId]: {} },
            nutritionDayIndex: { ...state.nutritionDayIndex, [studentId]: idx },
            nutritionHistory: { ...state.nutritionHistory, [studentId]: historyForStudent },
          });
        },
        updateHabit: (studentId, patch) => {
          const state = get();
          const current = state.habitsLog[studentId] ?? {};
          set({
            habitsLog: {
              ...state.habitsLog,
              [studentId]: { ...current, ...patch, updatedAt: new Date().toISOString() },
            },
          });
        },
        setCoachMealComment: (studentId, dateKey, mealId, comment) => {
          const state = get();
          const forStudent = { ...(state.coachMealComments[studentId] ?? {}) };
          const forDate = { ...(forStudent[dateKey] ?? {}) };
          if (comment.trim()) {
            forDate[mealId] = comment;
          } else {
            delete forDate[mealId];
          }
          forStudent[dateKey] = forDate;
          set({
            coachMealComments: { ...state.coachMealComments, [studentId]: forStudent },
          });
        },
        resetDemo: () =>
          set({
            students: seed.students,
            workoutTemplates: seed.workoutTemplates,
            nutritionTemplates: seed.nutritionTemplates,
            routines: {},
            nutritionPlans: {},
            weightLogs: {},
            reviews: {},
            habitsConfigured: {},
            media: {},
            messages: {},
            workoutProgress: {},
            nutritionProgress: {},
            nutritionExtras: {},
            nutritionDayIndex: {},
            habitsLog: {},
            nutritionHistory: {},
            coachMealComments: {},
          }),
      }),
      {
        name: persistName,
        version: 3,
        migrate: (persisted: unknown, _v: number) => persisted as State,
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );

const demoStore = createFitFlowStore("fitflow-demo", DEMO_SEED);
const accountStore = createFitFlowStore("fitflow-account", EMPTY_SEED);

const pickStore = (): UseBoundStore<StoreApi<State>> =>
  getMode() === "account" ? accountStore : demoStore;

// Dispatcher hook: keeps existing API. Selects the store based on current mode.
export const useDemoStore = (<T>(selector: (state: State) => T): T => {
  return pickStore()(selector);
}) as <T>(selector: (state: State) => T) => T;

export const getDemoState = (): State => pickStore().getState();

export const resetAccountStore = () => {
  accountStore.getState().resetDemo();
  try {
    localStorage.removeItem("fitflow-account");
    localStorage.removeItem("fitflow-demo-nuevo-draft");
  } catch {}
};

export const isNewStudent = (s?: StudentExt | null) => !!s?.createdAt;

export const useHydratedStudents = () => useDemoStore((s) => s.students);
