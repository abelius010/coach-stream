import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Search, MessageSquare, Plus } from "lucide-react";
import { chatMessages } from "../lib/demo-data";
import { useDemoStore } from "../lib/demo-store";
import { useMode } from "../lib/fitflow-mode";

export const Route = createFileRoute("/demo/chat")({
  component: ChatPage,
});

function ChatPage() {
  const mode = useMode();
  const students = useDemoStore((s) => s.students);
  const [activeId, setActiveId] = useState<string | null>(students[0]?.id ?? null);
  const active = students.find((s) => s.id === activeId) ?? students[0] ?? null;
  const [messages, setMessages] = useState(mode === "demo" ? chatMessages : []);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { from: "coach", text: text.trim(), time: "ahora" }]);
    setText("");
  };

  if (mode === "account" && (students.length === 0 || !active)) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Mensajes</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Todas las conversaciones con tus alumnos, en un solo lugar.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-surface text-ink-muted">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-sm font-semibold">Todavía no tienes conversaciones.</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">
            Añade tu primer alumno para empezar a intercambiar mensajes desde su ficha.
          </p>
          <Link
            to="/demo/alumnos/nuevo"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Crear primer alumno
          </Link>
        </div>
      </div>
    );
  }

  if (!active) return null;

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[300px_1fr]">
      <aside className="hidden flex-col border-r border-border bg-background md:flex">
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <input
              placeholder="Buscar conversación…"
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-ink-muted"
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {students.slice(0, 12).map((s, i) => {
            const isActive = s.id === active.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => setActiveId(s.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${
                    isActive ? "bg-surface" : "hover:bg-surface/50"
                  }`}
                >
                  <img src={s.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="text-[10px] text-ink-muted">
                        {mode === "demo" ? (i === 0 ? "8:32" : `${9 + i}:0${i}`) : ""}
                      </div>
                    </div>
                    <div className="truncate text-xs text-ink-muted">
                      {mode === "demo"
                        ? i === 0
                          ? "Enviado. Muchas gracias 🙏"
                          : "¿Cómo lo ves para esta semana?"
                        : "Sin mensajes aún"}
                    </div>
                  </div>
                  {mode === "demo" && i < 3 && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex min-w-0 flex-col bg-background">
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <img src={active.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{active.name}</div>
            <div className="truncate text-xs text-ink-muted">Activo · {active.lastActive}</div>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto bg-surface/30 p-4">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-xs text-ink-muted">
              Envía el primer mensaje para empezar la conversación.
            </div>
          ) : (
            messages.map((m, i) => {
              const isCoach = m.from === "coach";
              return (
                <div key={i} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${
                      isCoach ? "bg-foreground text-background" : "bg-background text-foreground border border-border"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className={`mt-1 text-[10px] ${isCoach ? "text-background/60" : "text-ink-muted"}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escribe un mensaje…"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/20"
          />
          <button onClick={send} className="grid h-10 w-10 place-items-center rounded-lg bg-foreground text-background hover:opacity-90">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
