import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PlaceholderScreen } from "@/components/alumno/PlaceholderScreen";

export const Route = createFileRoute("/alumno/chat")({
  head: () => ({
    meta: [
      { title: "Chat · FitFlow Alumno" },
      { name: "description", content: "Habla con tu entrenador en tiempo real." },
    ],
  }),
  component: () => (
    <PlaceholderScreen
      title="Chat"
      subtitle="Habla con tu entrenador cuando lo necesites."
      icon={<MessageCircle className="h-6 w-6" />}
    />
  ),
});
