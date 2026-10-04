import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modo Clásico",
  description:
    "Adivina el campeón de League of Legends del día comparando género, posición, especie, recurso, gama, región y año de lanzamiento.",
  alternates: { canonical: "/clasico" },
};

export default function ClasicoPage() {
  // TODO(v0.1): montar aquí el componente cliente del juego. Debe:
  //  - calcular "hoy" (UTC) EN EL CLIENTE: esta página se prerenderiza en build,
  //    así que el reto del día no puede resolverse en el servidor.
  //  - llamar a `useGameStore.persist.rehydrate()` y a `syncDay` al montarse.
  //  - usar getDailyChampion(), compareClassic() y buildShareText().
  return (
    <>
      <h1 className="text-2xl font-semibold">Modo Clásico</h1>
      <p className="mt-2 text-foreground/70">Próximamente.</p>
    </>
  );
}
