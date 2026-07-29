import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { students as seedStudents, type Student } from "./demo-data";

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

type State = {
  students: StudentExt[];
  role: DemoRole;
  workoutTemplates: WorkoutTemplate[];
  nutritionTemplates: NutritionTemplate[];
  setRole: (r: DemoRole) => void;
  addWorkoutTemplate: (t: Omit<WorkoutTemplate, "id" | "createdAt">) => void;
  addNutritionTemplate: (t: Omit<NutritionTemplate, "id" | "createdAt">) => void;
  addStudent: (input: NewStudentInput) => string;
  updateStudent: (id: string, patch: Partial<StudentExt>) => void;
  removeStudent: (id: string) => void;
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
      removeStudent: (id) => set({ students: get().students.filter((s) => s.id !== id) }),
      resetDemo: () => set({ students: seedStudents as StudentExt[] }),
    }),
    {
      name: "fitflow-demo",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useHydratedStudents = () => useDemoStore((s) => s.students);
