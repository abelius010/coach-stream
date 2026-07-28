// Mock data for the FitFlow interactive demo
export type Student = {
  id: string;
  name: string;
  avatar: string;
  goal: string;
  weight: number;
  weightStart: number;
  weightGoal: number;
  status: "activo" | "atencion" | "riesgo";
  lastActive: string;
  compliance: number; // 0-100
  startDate: string;
  height: number;
  age: number;
  plan: string;
};

const av = (i: number) => `https://i.pravatar.cc/160?img=${i}`;

export const students: Student[] = [
  { id: "juan-martinez", name: "Juan Martínez", avatar: av(12), goal: "Ganar músculo", weight: 78.4, weightStart: 72.0, weightGoal: 82, status: "activo", lastActive: "Hace 12 min", compliance: 94, startDate: "12 Feb 2025", height: 178, age: 28, plan: "Hipertrofia 4d" },
  { id: "laura-gomez", name: "Laura Gómez", avatar: av(47), goal: "Perder grasa", weight: 68.2, weightStart: 74.5, weightGoal: 63, status: "activo", lastActive: "Hace 34 min", compliance: 88, startDate: "3 Ene 2025", height: 165, age: 31, plan: "Recomp Full body" },
  { id: "maria-lopez", name: "María López", avatar: av(45), goal: "Recomposición", weight: 59.1, weightStart: 62.3, weightGoal: 57, status: "activo", lastActive: "Hace 1 h", compliance: 91, startDate: "22 Nov 2024", height: 162, age: 26, plan: "PPL 5d" },
  { id: "pedro-ruiz", name: "Pedro Ruiz", avatar: av(15), goal: "Fuerza", weight: 84.6, weightStart: 82.0, weightGoal: 88, status: "activo", lastActive: "Hace 2 h", compliance: 82, startDate: "10 Sep 2024", height: 182, age: 33, plan: "5x5 Fuerza" },
  { id: "ana-fernandez", name: "Ana Fernández", avatar: av(32), goal: "Tonificar", weight: 56.8, weightStart: 60.2, weightGoal: 55, status: "activo", lastActive: "Hoy 08:12", compliance: 96, startDate: "5 Mar 2025", height: 168, age: 29, plan: "Full body 3d" },
  { id: "carlos-perez", name: "Carlos Pérez", avatar: av(11), goal: "Volumen", weight: 88.3, weightStart: 80.4, weightGoal: 92, status: "atencion", lastActive: "Ayer", compliance: 71, startDate: "18 Ago 2024", height: 185, age: 34, plan: "Upper/Lower 4d" },
  { id: "sofia-diaz", name: "Sofía Díaz", avatar: av(48), goal: "Perder grasa", weight: 71.4, weightStart: 78.2, weightGoal: 64, status: "activo", lastActive: "Hace 3 h", compliance: 89, startDate: "1 Feb 2025", height: 170, age: 30, plan: "Cardio + Fuerza" },
  { id: "javier-santos", name: "Javier Santos", avatar: av(13), goal: "Ganar músculo", weight: 74.9, weightStart: 70.5, weightGoal: 80, status: "activo", lastActive: "Hace 5 h", compliance: 85, startDate: "14 Dic 2024", height: 176, age: 25, plan: "Push/Pull/Legs" },
  { id: "elena-morales", name: "Elena Morales", avatar: av(44), goal: "Recomposición", weight: 62.5, weightStart: 66.8, weightGoal: 60, status: "riesgo", lastActive: "Hace 4 días", compliance: 42, startDate: "20 Oct 2024", height: 164, age: 38, plan: "Full body 3d" },
  { id: "miguel-vega", name: "Miguel Vega", avatar: av(14), goal: "Fuerza", weight: 92.1, weightStart: 89.4, weightGoal: 95, status: "activo", lastActive: "Hace 6 h", compliance: 90, startDate: "8 Jul 2024", height: 188, age: 36, plan: "Powerbuilding" },
  { id: "clara-romero", name: "Clara Romero", avatar: av(49), goal: "Perder grasa", weight: 65.3, weightStart: 72.0, weightGoal: 60, status: "activo", lastActive: "Hoy 07:44", compliance: 93, startDate: "9 Ene 2025", height: 167, age: 27, plan: "Full body 4d" },
  { id: "raul-navarro", name: "Raúl Navarro", avatar: av(33), goal: "Hipertrofia", weight: 81.2, weightStart: 76.0, weightGoal: 85, status: "atencion", lastActive: "Hace 2 días", compliance: 68, startDate: "3 Nov 2024", height: 180, age: 32, plan: "PPL 6d" },
  { id: "lucia-castro", name: "Lucía Castro", avatar: av(31), goal: "Tonificar", weight: 58.0, weightStart: 61.5, weightGoal: 56, status: "activo", lastActive: "Hace 45 min", compliance: 87, startDate: "17 Feb 2025", height: 163, age: 24, plan: "Glúteo focus" },
  { id: "david-alonso", name: "David Alonso", avatar: av(52), goal: "Volumen", weight: 79.5, weightStart: 73.2, weightGoal: 84, status: "activo", lastActive: "Hace 1 h", compliance: 92, startDate: "28 Dic 2024", height: 179, age: 29, plan: "Upper/Lower 4d" },
  { id: "irene-serrano", name: "Irene Serrano", avatar: av(20), goal: "Perder grasa", weight: 69.7, weightStart: 76.4, weightGoal: 63, status: "riesgo", lastActive: "Hace 5 días", compliance: 38, startDate: "12 Sep 2024", height: 169, age: 40, plan: "Cardio + Fuerza" },
  { id: "adrian-molina", name: "Adrián Molina", avatar: av(53), goal: "Fuerza", weight: 86.8, weightStart: 83.0, weightGoal: 90, status: "activo", lastActive: "Hace 20 min", compliance: 89, startDate: "6 Oct 2024", height: 183, age: 31, plan: "5/3/1" },
  { id: "paula-herrera", name: "Paula Herrera", avatar: av(25), goal: "Recomposición", weight: 61.2, weightStart: 64.0, weightGoal: 58, status: "activo", lastActive: "Hoy 09:02", compliance: 95, startDate: "22 Ene 2025", height: 166, age: 28, plan: "Full body 3d" },
  { id: "hugo-blanco", name: "Hugo Blanco", avatar: av(51), goal: "Hipertrofia", weight: 77.6, weightStart: 72.4, weightGoal: 82, status: "atencion", lastActive: "Hace 2 días", compliance: 74, startDate: "11 Nov 2024", height: 175, age: 26, plan: "PPL 5d" },
  { id: "natalia-cano", name: "Natalia Cano", avatar: av(21), goal: "Perder grasa", weight: 72.1, weightStart: 79.5, weightGoal: 65, status: "activo", lastActive: "Hace 90 min", compliance: 88, startDate: "3 Feb 2025", height: 171, age: 35, plan: "HIIT + Fuerza" },
  { id: "sergio-vidal", name: "Sergio Vidal", avatar: av(54), goal: "Volumen", weight: 82.4, weightStart: 76.8, weightGoal: 88, status: "activo", lastActive: "Hace 4 h", compliance: 86, startDate: "19 Dic 2024", height: 181, age: 30, plan: "Upper/Lower 4d" },
];

export const activityFeed = [
  { who: "Juan Martínez", what: "terminó el entrenamiento Push A", time: "hace 4 min", type: "workout" },
  { who: "Laura Gómez", what: "ha registrado 68,2 kg", time: "hace 11 min", type: "weight" },
  { who: "María López", what: "ha subido la comida del desayuno", time: "hace 18 min", type: "meal" },
  { who: "Pedro Ruiz", what: "ha enviado un vídeo de peso muerto", time: "hace 24 min", type: "video" },
  { who: "Ana Fernández", what: "completó su objetivo diario de agua", time: "hace 32 min", type: "habit" },
  { who: "Clara Romero", what: "completó Pull B (6/6 ejercicios)", time: "hace 41 min", type: "workout" },
  { who: "Paula Herrera", what: "subió fotos de progreso semanal", time: "hace 55 min", type: "photo" },
  { who: "David Alonso", what: "registró 8.240 pasos", time: "hace 1 h", type: "habit" },
  { who: "Sofía Díaz", what: "envió un mensaje nuevo", time: "hace 1 h", type: "chat" },
  { who: "Adrián Molina", what: "batió PR en sentadilla: 140 kg x 3", time: "hace 2 h", type: "workout" },
];

export const smartTasks = [
  { id: 1, title: "Revisar el vídeo de sentadilla de Juan Martínez", meta: "Vídeo enviado hace 3 h", tag: "Vídeo", priority: "alta" },
  { id: 2, title: "Actualizar la dieta de María López", meta: "Última actualización hace 4 semanas", tag: "Nutrición", priority: "media" },
  { id: 3, title: "Comparar las fotos semanales de Pedro Ruiz", meta: "3 fotos nuevas", tag: "Progreso", priority: "media" },
  { id: 4, title: "Responder el mensaje de Laura Gómez", meta: "Enviado hace 45 min", tag: "Chat", priority: "alta" },
  { id: 5, title: "Revisión semanal de Carlos Pérez", meta: "Prevista para hoy", tag: "Revisión", priority: "alta" },
  { id: 6, title: "Contactar con Elena Morales", meta: "4 días sin actividad", tag: "Seguimiento", priority: "alta" },
  { id: 7, title: "Enviar plan actualizado a Ana Fernández", meta: "Cambio de fase", tag: "Nutrición", priority: "baja" },
  { id: 8, title: "Ajustar cargas de entrenamiento de Adrián Molina", meta: "PR alcanzado", tag: "Entreno", priority: "media" },
];

export const weightSeries = [
  { w: 1, kg: 78.4 }, { w: 2, kg: 78.1 }, { w: 3, kg: 77.6 }, { w: 4, kg: 77.2 },
  { w: 5, kg: 76.8 }, { w: 6, kg: 76.2 }, { w: 7, kg: 75.9 }, { w: 8, kg: 75.4 },
  { w: 9, kg: 75.1 }, { w: 10, kg: 74.7 }, { w: 11, kg: 74.3 }, { w: 12, kg: 74.0 },
];

export const workoutWeeks = [
  {
    week: "Semana 12 · 24-30 Nov",
    days: [
      { day: "Lun · Push A", done: true, exercises: [
        { name: "Press banca", sets: "4x8", weight: "70 kg", note: "RIR 2" },
        { name: "Press militar", sets: "4x10", weight: "40 kg", note: "" },
        { name: "Fondos", sets: "3x12", weight: "BW+10", note: "Buena técnica" },
        { name: "Extensión tríceps", sets: "3x12", weight: "22 kg", note: "" },
      ]},
      { day: "Mar · Pull A", done: true, exercises: [
        { name: "Dominadas", sets: "4x8", weight: "BW+5", note: "Rango completo" },
        { name: "Remo con barra", sets: "4x10", weight: "60 kg", note: "" },
        { name: "Curl bíceps", sets: "3x12", weight: "14 kg", note: "" },
        { name: "Face pulls", sets: "3x15", weight: "20 kg", note: "" },
      ]},
      { day: "Mié · Legs", done: true, exercises: [
        { name: "Sentadilla", sets: "5x5", weight: "100 kg", note: "RIR 1" },
        { name: "Peso muerto rumano", sets: "4x8", weight: "90 kg", note: "" },
        { name: "Prensa", sets: "3x12", weight: "160 kg", note: "" },
        { name: "Femoral tumbado", sets: "3x12", weight: "35 kg", note: "" },
      ]},
      { day: "Jue · Push B", done: true, exercises: [
        { name: "Press inclinado", sets: "4x8", weight: "55 kg", note: "" },
        { name: "Aperturas polea", sets: "3x12", weight: "12 kg", note: "" },
        { name: "Elevaciones laterales", sets: "4x15", weight: "8 kg", note: "" },
      ]},
      { day: "Vie · Pull B", done: false, exercises: [
        { name: "Peso muerto", sets: "4x5", weight: "120 kg", note: "" },
        { name: "Jalón al pecho", sets: "4x10", weight: "55 kg", note: "" },
        { name: "Curl martillo", sets: "3x12", weight: "16 kg", note: "" },
      ]},
    ],
  },
];

export const nutritionPlan = {
  targets: { kcal: 2650, protein: 175, carbs: 320, fat: 75 },
  meals: [
    { name: "Desayuno", time: "08:00", kcal: 620, protein: 42, carbs: 85, fat: 14, items: ["Avena 90 g", "Claras 200 g + 1 huevo", "Plátano", "Café solo"], photo: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=300&fit=crop" },
    { name: "Media mañana", time: "11:30", kcal: 380, protein: 30, carbs: 40, fat: 8, items: ["Yogur griego 200 g", "Frutos rojos", "Nueces 20 g"], photo: null },
    { name: "Comida", time: "14:00", kcal: 780, protein: 55, carbs: 90, fat: 22, items: ["Pollo 180 g", "Arroz basmati 100 g", "Ensalada mixta", "AOVE 10 g"], photo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" },
    { name: "Merienda", time: "17:30", kcal: 320, protein: 25, carbs: 40, fat: 6, items: ["Batido de proteína", "Tortitas de arroz", "Crema de cacahuete"], photo: null },
    { name: "Cena", time: "21:00", kcal: 550, protein: 45, carbs: 45, fat: 18, items: ["Salmón 180 g", "Boniato 200 g", "Espárragos"], photo: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
  ],
  coachNote: "Mantén los hidratos altos en días de pierna. Reduce 20 g en descanso.",
};

export const habitsData = {
  steps: [7420, 8100, 6540, 9200, 8420, 5100, 8240],
  water: [2.4, 3.0, 2.8, 3.2, 2.6, 2.0, 3.1],
  sleep: [7.2, 6.8, 7.5, 8.0, 7.1, 6.5, 7.8],
  mood: [4, 4, 3, 5, 4, 3, 5],
};

export const measurements = [
  { part: "Pecho", start: 96, current: 101, unit: "cm" },
  { part: "Brazo", start: 34, current: 37, unit: "cm" },
  { part: "Cintura", start: 82, current: 79, unit: "cm" },
  { part: "Cadera", start: 96, current: 95, unit: "cm" },
  { part: "Muslo", start: 56, current: 60, unit: "cm" },
  { part: "% Grasa", start: 18, current: 14.5, unit: "%" },
];

export const gallery = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1540474527619-a24b0e5a29b5?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
];

export const chatMessages = [
  { from: "student", text: "Buenos días Carlos, esta semana me he sentido mucho mejor con el nuevo plan.", time: "08:12" },
  { from: "coach", text: "¡Me alegra oírlo Juan! ¿Cómo notas la recuperación entre series?", time: "08:14" },
  { from: "student", text: "Mucho mejor. En el press de banca subí a 72 kg sin problema.", time: "08:15" },
  { from: "coach", text: "Perfecto 🔥 La semana que viene aumentaremos ligeramente los hidratos en días de pierna.", time: "08:16" },
  { from: "student", text: "Genial. ¿Te envío el vídeo de sentadilla para que lo revises?", time: "08:18" },
  { from: "coach", text: "Sí, mándalo cuando puedas. Lo reviso hoy mismo.", time: "08:19" },
  { from: "student", text: "Enviado. Muchas gracias 🙏", time: "08:32" },
];

export const stats = {
  activeStudents: 75,
  pendingReviews: 8,
  pendingVideos: 12,
  newMealPhotos: 24,
  inactiveStudents: 5,
  missingWeights: 9,
};
