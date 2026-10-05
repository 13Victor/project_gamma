import type { Metadata } from "next";
import { getPlayableChampions } from "@/lib/champions";
import { ClassicGame } from "./ClassicGame";

export const metadata: Metadata = {
  title: "Modo Clásico",
  description:
    "Adivina el campeón de League of Legends del día comparando sus atributos con los de tus intentos.",
  alternates: { canonical: "/clasico" },
};

export default function ClasicoPage() {
  return (
    <>
      <h1>Modo Clásico</h1>
      <ClassicGame champions={getPlayableChampions()} />
    </>
  );
}
