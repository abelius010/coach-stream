import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { students as seedStudents, workoutWeeks as seedWorkoutWeeks, nutritionPlan as seedNutrition, type Student } from "./demo-data";
import { getMode, useMode } from "./fitflow-mode";
import { supabase } from "./supabase";

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
  studentsLoading: boolean;
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

// --- Supabase sync helpers (solo se usan para la tienda "account", nunca
// para la tienda "demo" de marketing) ---------------------------------

const studentToRow = (s: StudentExt) => ({
  id: s.id,
  name: s.name,
  last_name: s.lastName ?? null,
  avatar: s.avatar ?? null,
  email: s.email ?? null,
  phone: s.phone ?? null,
  birth_date: s.birthDate ?? null,
  sex: s.sex ?? null,
  goal: s.goal ?? null,
  secondary_goal: s.secondaryGoal ?? null,
  weight: s.weight ?? null,
  weight_start: s.weightStart ?? null,
  weight_goal: s.weightGoal ?? null,
  height: s.height ?? null,
  age: s.age ?? null,
  body_fat: s.bodyFat ?? null,
  measurements: s.measurements ?? null,
  status: s.status,
  last_active: s.lastActive ?? null,
  compliance: s.compliance ?? 0,
  start_date: s.startDate ?? null,
  plan: s.plan ?? null,
  experience: s.experience ?? null,
  days_per_week: s.daysPerWeek ?? null,
  session_minutes: s.sessionMinutes ?? null,
  equipment: s.equipment ?? null,
  preference: s.preference ?? null,
  injuries: s.injuries ?? null,
  coach_notes: s.coachNotes ?? null,
  next_review: s.nextReview ?? null,
  created_at: s.createdAt ?? null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToStudent = (r: any): StudentExt => ({
  id: r.id,
  name: r.name,
  lastName: r.last_name ?? undefined,
  avatar: r.avatar ?? "",
  email: r.email ?? undefined,
  phone: r.phone ?? undefined,
  birthDate: r.birth_date ?? undefined,
  sex: r.sex ?? undefined,
  goal: r.goal ?? "",
  secondaryGoal: r.secondary_goal ?? undefined,
  weight: r.weight ?? 0,
  weightStart: r.weight_start ?? 0,
  weightGoal: r.weight_goal ?? 0,
  height: r.height ?? 0,
  age: r.age ?? 0,
  bodyFat: r.body_fat ?? undefined,
  measurements: r.measurements ?? undefined,
  status: r.status ?? "activo",
  lastActive: r.last_active ?? "",
  compliance: r.compliance ?? 0,
  startDate: r.start_date ?? "",
  plan: r.plan ?? "",
  experience: r.experience ?? undefined,
  daysPerWeek: r.days_per_week ?? undefined,
  sessionMinutes: r.session_minutes ?? undefined,
  equipment: r.equipment ?? undefined,
  preference: r.preference ?? undefined,
  injuries: r.injuries ?? undefined,
  coachNotes: r.coach_notes ?? undefined,
  nextReview: r.next_review ?? undefined,
  createdAt: r.created_at ?? undefined,
});

const syncAddStudent = async (synced: boolean, s: StudentExt) => {
  if (!synced) return;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("[supabase] No hay sesión activa, no se crea el alumno:", userError?.message);
    return;
  }
  const row = { ...studentToRow(s), trainer_id: user.id };
  const { error } = await supabase.from("alumnos").insert(row);
  if (error) console.error("[supabase] Error creando alumno:", error.message);
};

// Maps StudentExt keys to their column name in `alumnos`. Used so a partial
// update only ever touches the columns that actually changed.
const FIELD_TO_COLUMN: Record<string, string> = {
  name: "name",
  lastName: "last_name",
  avatar: "avatar",
  email: "email",
  phone: "phone",
  birthDate: "birth_date",
  sex: "sex",
  goal: "goal",
  secondaryGoal: "secondary_goal",
  weight: "weight",
  weightStart: "weight_start",
  weightGoal: "weight_goal",
  height: "height",
  age: "age",
  bodyFat: "body_fat",
  measurements: "measurements",
  status: "status",
  lastActive: "last_active",
  compliance: "compliance",
  startDate: "start_date",
  plan: "plan",
  experience: "experience",
  daysPerWeek: "days_per_week",
  sessionMinutes: "session_minutes",
  equipment: "equipment",
  preference: "preference",
  injuries: "injuries",
  coachNotes: "coach_notes",
  nextReview: "next_review",
  createdAt: "created_at",
};

const syncUpdateStudent = async (synced: boolean, id: string, patch: Partial<StudentExt>) => {
  if (!synced) return;
  const partialRow: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const column = FIELD_TO_COLUMN[key];
    if (column) partialRow[column] = value;
  }
  if (Object.keys(partialRow).length === 0) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[supabase] No hay sesión activa, no se actualiza el alumno.");
    return;
  }
  const { error } = await supabase
    .from("alumnos")
    .update(partialRow)
    .eq("id", id)
    .eq("trainer_id", user.id);
  if (error) console.error("[supabase] Error actualizando alumno:", error.message);
};

const syncRemoveStudent = async (synced: boolean, id: string) => {
  if (!synced) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[supabase] No hay sesión activa, no se elimina el alumno.");
    return;
  }
  const { error } = await supabase.from("alumnos").delete().eq("id", id).eq("trainer_id", user.id);
  if (error) console.error("[supabase] Error eliminando alumno:", error.message);
};

export const hydrateStudentsFromSupabase = async () => {
  accountStore.setState({ studentsLoading: true });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("[supabase] No hay sesión activa, no se cargan alumnos:", userError?.message);
    accountStore.setState({ students: [], studentsLoading: false });
    return;
  }
  const { data, error } = await supabase
    .from("alumnos")
    .select("*")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] Error cargando alumnos:", error.message);
    accountStore.setState({ students: [], studentsLoading: false });
    return;
  }
  accountStore.setState({ students: (data ?? []).map(rowToStudent), studentsLoading: false });
};

// ---------- Entrenamientos: rutina (plan → semanas → días → ejercicios) ----------
// Un único plan "activo" por alumno, con un id determinista — coincide con el
// modelo actual de la app (una sola rutina por alumno, editada de golpe).

const trainingPlanId = (studentId: string) => `plan_${studentId}`;

const syncSaveRoutine = async (synced: boolean, studentId: string, weeks: RoutineWeek[]) => {
  if (!synced) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[supabase] No hay sesión activa, no se guarda la rutina.");
    return;
  }
  const planId = trainingPlanId(studentId);
  const { error: planError } = await supabase.from("training_plans").upsert({
    id: planId,
    trainer_id: user.id,
    student_id: studentId,
    name: "Rutina",
    status: "active",
    updated_at: new Date().toISOString(),
  });
  if (planError) {
    console.error("[supabase] Error guardando el plan:", planError.message);
    return;
  }

  // Semanas: upsert las que siguen existiendo, borra las que el entrenador quitó.
  const { data: existingWeeks } = await supabase.from("training_weeks").select("id").eq("training_plan_id", planId);
  const existingWeekIds = new Set((existingWeeks ?? []).map((w) => w.id as string));
  const currentWeekIds = new Set(weeks.map((w) => w.id));
  const removedWeekIds = [...existingWeekIds].filter((id) => !currentWeekIds.has(id));
  if (removedWeekIds.length) {
    await supabase.from("training_weeks").delete().in("id", removedWeekIds);
  }
  if (weeks.length) {
    const weekRows = weeks.map((w, i) => ({ id: w.id, training_plan_id: planId, name: w.week, position: i }));
    const { error } = await supabase.from("training_weeks").upsert(weekRows);
    if (error) console.error("[supabase] Error guardando semanas:", error.message);
  }

  for (const week of weeks) {
    const { data: existingDays } = await supabase.from("training_days").select("id").eq("training_week_id", week.id);
    const existingDayIds = new Set((existingDays ?? []).map((d) => d.id as string));
    const currentDayIds = new Set(week.days.map((d) => d.id));
    const removedDayIds = [...existingDayIds].filter((id) => !currentDayIds.has(id));
    if (removedDayIds.length) {
      await supabase.from("training_days").delete().in("id", removedDayIds);
    }
    if (week.days.length) {
      const dayRows = week.days.map((d, i) => ({
        id: d.id,
        training_week_id: week.id,
        name: d.day,
        done: !!d.done,
        position: i,
      }));
      const { error } = await supabase.from("training_days").upsert(dayRows);
      if (error) console.error("[supabase] Error guardando días:", error.message);
    }

    for (const day of week.days) {
      const { data: existingExercises } = await supabase
        .from("training_exercises")
        .select("id")
        .eq("training_day_id", day.id);
      const existingExIds = new Set((existingExercises ?? []).map((e) => e.id as string));
      const currentExIds = new Set(day.exercises.map((e) => e.id));
      const removedExIds = [...existingExIds].filter((id) => !currentExIds.has(id));
      if (removedExIds.length) {
        await supabase.from("training_exercises").delete().in("id", removedExIds);
      }
      if (day.exercises.length) {
        const exRows = day.exercises.map((e, i) => ({
          id: e.id,
          training_day_id: day.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          note: e.note,
          position: i,
        }));
        const { error } = await supabase.from("training_exercises").upsert(exRows);
        if (error) console.error("[supabase] Error guardando ejercicios:", error.message);
      }
    }
  }
};

export const hydrateRoutineFromSupabase = async (studentId: string) => {
  const planId = trainingPlanId(studentId);
  const { data, error } = await supabase
    .from("training_weeks")
    .select(
      "id, name, position, training_days(id, name, done, position, training_exercises(id, name, sets, reps, weight, note, position))",
    )
    .eq("training_plan_id", planId)
    .order("position", { ascending: true });
  if (error) {
    console.error("[supabase] Error cargando la rutina:", error.message);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];
  const weeks: RoutineWeek[] = rows.map((w) => ({
    id: w.id,
    week: w.name,
    days: [...(w.training_days ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((d) => ({
        id: d.id,
        day: d.name,
        done: d.done,
        exercises: [...(d.training_exercises ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((e) => ({
            id: e.id,
            name: e.name,
            sets: e.sets ?? "",
            reps: e.reps ?? "",
            weight: e.weight ?? "",
            note: e.note ?? "",
          })),
      })),
  }));
  const state = accountStore.getState();
  accountStore.setState({ routines: { ...state.routines, [studentId]: weeks } });
};

// ---------- Progreso del alumno: sesión por día + serie por ejercicio ----------
// Una sesión = un día concreto de la rutina para un alumno (id determinista,
// un único registro por día, igual que el modelo local actual).

const workoutSessionId = (studentId: string, dayId: string) => `sess_${studentId}_${dayId}`;

const ensureWorkoutSession = async (studentId: string, dayId: string): Promise<string | null> => {
  const id = workoutSessionId(studentId, dayId);
  const { error } = await supabase
    .from("workout_sessions")
    .upsert({ id, student_id: studentId, training_day_id: dayId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) {
    console.error("[supabase] Error creando la sesión de entrenamiento:", error.message);
    return null;
  }
  return id;
};

// Las series (set_number >= 0) guardan si esa serie concreta está hecha.
// Un registro aparte con set_number = -1 guarda el peso/nota a nivel de
// ejercicio (que en la app actual no es por serie, sino por ejercicio).
const syncToggleSet = async (
  synced: boolean,
  studentId: string,
  dayId: string,
  exerciseId: string,
  setIndex: number,
  done: boolean,
) => {
  if (!synced) return;
  const sessionId = await ensureWorkoutSession(studentId, dayId);
  if (!sessionId) return;
  const { error } = await supabase.from("exercise_logs").upsert({
    id: `log_${sessionId}_${exerciseId}_${setIndex}`,
    workout_session_id: sessionId,
    training_exercise_id: exerciseId,
    set_number: setIndex,
    completed: done,
  });
  if (error) console.error("[supabase] Error guardando la serie:", error.message);
};

const upsertExerciseMeta = async (
  studentId: string,
  dayId: string,
  exerciseId: string,
  patch: { weight?: string; note?: string },
) => {
  const sessionId = await ensureWorkoutSession(studentId, dayId);
  if (!sessionId) return;
  const id = `log_${sessionId}_${exerciseId}_meta`;
  const { data: existing } = await supabase.from("exercise_logs").select("weight, note").eq("id", id).maybeSingle();
  const { error } = await supabase.from("exercise_logs").upsert({
    id,
    workout_session_id: sessionId,
    training_exercise_id: exerciseId,
    set_number: -1,
    weight: existing?.weight ?? null,
    note: existing?.note ?? null,
    ...patch,
  });
  if (error) console.error("[supabase] Error guardando datos del ejercicio:", error.message);
};

const syncSetExerciseWeight = async (
  synced: boolean,
  studentId: string,
  dayId: string,
  exerciseId: string,
  weight: string,
) => {
  if (!synced) return;
  await upsertExerciseMeta(studentId, dayId, exerciseId, { weight });
};

const syncSetExerciseNote = async (
  synced: boolean,
  studentId: string,
  dayId: string,
  exerciseId: string,
  note: string,
) => {
  if (!synced) return;
  await upsertExerciseMeta(studentId, dayId, exerciseId, { note });
};

const syncFinishDay = async (synced: boolean, studentId: string, dayId: string) => {
  if (!synced) return;
  const sessionId = await ensureWorkoutSession(studentId, dayId);
  if (!sessionId) return;
  const { error } = await supabase
    .from("workout_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) console.error("[supabase] Error marcando el día como completado:", error.message);
  const { error: dayError } = await supabase.from("training_days").update({ done: true }).eq("id", dayId);
  if (dayError) console.error("[supabase] Error actualizando el día:", dayError.message);
};

const syncResetDayProgress = async (synced: boolean, studentId: string, dayId: string) => {
  if (!synced) return;
  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", workoutSessionId(studentId, dayId));
  if (error) console.error("[supabase] Error reiniciando el progreso del día:", error.message);
  const { error: dayError } = await supabase.from("training_days").update({ done: false }).eq("id", dayId);
  if (dayError) console.error("[supabase] Error actualizando el día:", dayError.message);
};

export const hydrateProgressFromSupabase = async (studentId: string) => {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("training_day_id, completed_at, exercise_logs(training_exercise_id, set_number, weight, note, completed)")
    .eq("student_id", studentId);
  if (error) {
    console.error("[supabase] Error cargando el progreso:", error.message);
    return;
  }
  const progress: Record<string, DayProgress> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const session of (data ?? []) as any[]) {
    const exercises: Record<string, ExerciseProgress> = {};
    for (const log of session.exercise_logs ?? []) {
      const exId = log.training_exercise_id as string;
      if (!exercises[exId]) exercises[exId] = { sets: [] };
      if (log.set_number === -1) {
        exercises[exId].weightUsed = log.weight ?? undefined;
        exercises[exId].note = log.note ?? undefined;
      } else {
        const idx = log.set_number as number;
        const sets = exercises[exId].sets;
        while (sets.length <= idx) sets.push({ done: false });
        sets[idx] = { done: !!log.completed };
      }
    }
    for (const exId of Object.keys(exercises)) {
      const sets = exercises[exId].sets;
      exercises[exId].done = sets.length > 0 && sets.every((s) => s.done);
    }
    progress[session.training_day_id as string] = {
      exercises,
      finishedAt: session.completed_at ?? undefined,
    };
  }
  const state = accountStore.getState();
  accountStore.setState({ workoutProgress: { ...state.workoutProgress, [studentId]: progress } });
};

const createFitFlowStore = (persistName: string, seed: Seed, synced: boolean) =>
  create<State>()(
    persist(
      (set, get) => ({
        students: seed.students,
        studentsLoading: false,
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
          syncAddStudent(synced, student);
          return id;
        },
        updateStudent: (id, patch) => {
          set({
            students: get().students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          });
          syncUpdateStudent(synced, id, patch);
        },
        removeStudent: (id) => {
          syncRemoveStudent(synced, id);
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
        setRoutine: (studentId, weeks) => {
          set({ routines: { ...get().routines, [studentId]: weeks } });
          syncSaveRoutine(synced, studentId, weeks);
        },
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
          syncToggleSet(synced, studentId, dayId, exerciseId, setIndex, sets[setIndex].done);
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
          syncSetExerciseWeight(synced, studentId, dayId, exerciseId, weight);
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
          syncSetExerciseNote(synced, studentId, dayId, exerciseId, note);
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
          syncFinishDay(synced, studentId, dayId);
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
          syncResetDayProgress(synced, studentId, dayId);
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
            studentsLoading: false,
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

const demoStore = createFitFlowStore("fitflow-demo", DEMO_SEED, false);
const accountStore = createFitFlowStore("fitflow-account", EMPTY_SEED, true);

const pickStore = (mode: "demo" | "account"): UseBoundStore<StoreApi<State>> =>
  mode === "account" ? accountStore : demoStore;

// Dispatcher hook: keeps existing API. Selects the store based on current mode.
// Uses useMode() (SSR-safe, matches server on first paint) instead of reading
// localStorage directly, so this never disagrees with what the server
// rendered and never causes a React hydration mismatch.
export const useDemoStore = (<T>(selector: (state: State) => T): T => {
  const mode = useMode();
  return pickStore(mode)(selector);
}) as <T>(selector: (state: State) => T) => T;

export const getDemoState = (): State => pickStore(getMode()).getState();

export const resetAccountStore = () => {
  accountStore.getState().resetDemo();
  try {
    localStorage.removeItem("fitflow-account");
    localStorage.removeItem("fitflow-demo-nuevo-draft");
  } catch {}
};

export const isNewStudent = (s?: StudentExt | null) => !!s?.createdAt;

export const useHydratedStudents = () => useDemoStore((s) => s.students);
