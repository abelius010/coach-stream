import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { PlaceholderScreen } from "@/components/alumno/PlaceholderScreen";

export const Route = createFileRoute("/alumno/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil · FitFlow Alumno" },
      { name: "description", content: "Tu perfil, objetivos y ajustes de la cuenta." },
    ],
  }),
  component: () => (
    <PlaceholderScreen
      title="Perfil"
      subtitle="Gestiona tus datos, objetivos y preferencias."
      icon={<User className="h-6 w-6" />}
    />
  ),
});
