import type { Champion } from "../../types/champion";

/** Campos mínimos necesarios para comparar (facilita los tests). */
export type ComparableChampion = Pick<
  Champion,
  | "id"
  | "gender"
  | "positions"
  | "species"
  | "resource"
  | "classes"
  | "region"
  | "releaseYear"
>;

export type MatchStatus = "match" | "miss";
/** "up": el objetivo salió DESPUÉS (año mayor). "down": salió ANTES. */
export type YearStatus = "match" | "up" | "down";

export interface ClassicComparison {
  gender: MatchStatus;
  positions: MatchStatus;
  species: MatchStatus;
  resource: MatchStatus;
  classes: MatchStatus;
  region: MatchStatus;
  releaseYear: YearStatus;
  /** True solo si se ha acertado el campeón exacto (mismo id). */
  isCorrect: boolean;
}

/** Orden de las columnas (spec.md §4.2). También lo usa el texto de compartir. */
export const CLASSIC_ATTRIBUTES = [
  "gender",
  "positions",
  "species",
  "resource",
  "classes",
  "region",
  "releaseYear",
] as const;

function intersects(a: readonly string[], b: readonly string[]): boolean {
  return a.some((item) => b.includes(item));
}

function equal(a: string, b: string): MatchStatus {
  return a === b ? "match" : "miss";
}

function overlap(a: readonly string[], b: readonly string[]): MatchStatus {
  return intersects(a, b) ? "match" : "miss";
}

/**
 * Compara un intento contra el campeón objetivo. Función pura (spec.md §4.4).
 */
export function compareClassic(
  guess: ComparableChampion,
  target: ComparableChampion
): ClassicComparison {
  let releaseYear: YearStatus = "match";
  if (target.releaseYear > guess.releaseYear) releaseYear = "up";
  else if (target.releaseYear < guess.releaseYear) releaseYear = "down";

  return {
    gender: equal(guess.gender, target.gender),
    positions: overlap(guess.positions, target.positions),
    species: equal(guess.species, target.species),
    resource: equal(guess.resource, target.resource),
    classes: overlap(guess.classes, target.classes),
    region: equal(guess.region, target.region),
    releaseYear,
    isCorrect: guess.id === target.id,
  };
}
