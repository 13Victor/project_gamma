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
    <>
      <h1>Cómo jugar</h1>
      <p>
        Cada día hay un campeón secreto. Escribe el nombre de un campeón, elige
        uno de la lista y compara sus atributos con los del campeón del día. No
        hay límite de intentos: sigue hasta acertar.
      </p>
      <ul>
        <li>Género, especie, recurso y región: verde si coinciden.</li>
        <li>Posición y gama: verde si comparten al menos una.</li>
        <li>
          Año de lanzamiento: verde si coincide; una flecha indica si el
          campeón del día salió después (↑) o antes (↓).
        </li>
      </ul>
      <p>El campeón cambia cada día a las 00:00 UTC, igual para todo el mundo.</p>
      <p>
        <Link href="/clasico">Jugar al modo Clásico</Link>
      </p>
    </>
  );
}
