import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { PlaceholderScreen } from "@/components/alumno/PlaceholderScreen";

export const Route = createFileRoute("/alumno/entrenamiento")({
  head: () => ({
    meta: [
      { title: "Entrenamiento · FitFlow Alumno" },
      { name: "description", content: "Tu plan de entrenamiento semanal." },
    ],
  }),
  component: () => (
    <PlaceholderScreen
      title="Entrenamiento"
      subtitle="Aquí verás tu rutina de la semana y podrás registrar cada sesión."
      icon={<Dumbbell className="h-6 w-6" />}
    />
  ),
});
