import { createFileRoute } from "@tanstack/react-router";
import { Salad } from "lucide-react";
import { PlaceholderScreen } from "@/components/alumno/PlaceholderScreen";

export const Route = createFileRoute("/alumno/nutricion")({
  head: () => ({
    meta: [
      { title: "Nutrición · FitFlow Alumno" },
      { name: "description", content: "Tu plan de nutrición y registro de comidas." },
    ],
  }),
  component: () => (
    <PlaceholderScreen
      title="Nutrición"
      subtitle="Aquí verás tu plan y podrás registrar tus comidas del día."
      icon={<Salad className="h-6 w-6" />}
    />
  ),
});
