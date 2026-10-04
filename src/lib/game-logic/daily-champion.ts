import { getDailyIndex } from "./daily-seed";

/** Namespace del modo Clásico para `getDailyIndex` (spec.md §3.3). */
export const CLASSIC_NAMESPACE = "clasico";

/**
 * Campeón objetivo del día para el modo Clásico.
 *
 * Ordena por `id` (copia) para que el resultado no dependa del orden en que
 * llegue la lista. OJO: el índice depende de `champions.length`, así que
 * añadir campeones nuevos al JSON cambia el reto de los días siguientes.
 */
export function getDailyChampion<T extends { id: string }>(
  date: Date,
  champions: readonly T[]
): T {
  const sorted = [...champions].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  );
  return sorted[getDailyIndex(date, sorted.length, CLASSIC_NAMESPACE)];
}
