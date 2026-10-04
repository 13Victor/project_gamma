import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo jugar",
  description:
    "Reglas del modo Clásico: escribe un campeón, compara sus atributos con el del día y acierta sin límite de intentos.",
  alternates: { canonical: "/como-jugar" },
};

export default function ComoJugarPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <h1 className="text-2xl font-semibold">Cómo jugar</h1>
      <p className="mt-3">
        Cada día hay un campeón secreto. Escribe el nombre de un campeón, elige
        uno de la lista y compara sus atributos con los del campeón del día.
        No hay límite de intentos: sigue hasta acertar.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Atributos</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Género, especie, recurso y región: verde si coinciden.</li>
        <li>Posición y gama: verde si comparten al menos una.</li>
        <li>
          Año de lanzamiento: verde si coincide; una flecha indica si el
          campeón del día salió después (↑) o antes (↓).
        </li>
      </ul>

      <h2 className="mt-6 text-lg font-semibold">Nuevo reto</h2>
      <p className="mt-2">
        El campeón cambia cada día a las 00:00 UTC, igual para todo el mundo.
      </p>

      <p className="mt-6">
        <Link href="/clasico" className="font-medium underline">
          Jugar al modo Clásico
        </Link>
      </p>
    </div>
  );
}
