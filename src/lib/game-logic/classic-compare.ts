import type { Champion } from "../../types/champion";

/**
 * Campos necesarios para comparar. Los atributos manuales son opcionales:
 * si falta en alguno de los dos campeones, ese atributo es "unknown".
 */
export type ComparableChampion = Pick<Champion, "id" | "classes" | "resource"> &
  Partial<
    Pick<
      Champion,
      "gender" | "positions" | "species" | "region" | "releaseYear"
    >
  >;

export type MatchStatus = "match" | "miss" | "unknown";
/** "up": el objetivo salió DESPUÉS (año mayor). "down": salió ANTES. */
export type YearStatus = "match" | "up" | "down" | "unknown";

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

function equal(a?: string, b?: string): MatchStatus {
  if (a === undefined || b === undefined) return "unknown";
  return a === b ? "match" : "miss";
}

function overlap(
  a?: readonly string[],
  b?: readonly string[]
): MatchStatus {
  if (a === undefined || b === undefined) return "unknown";
  return a.some((item) => b.includes(item)) ? "match" : "miss";
}

function compareYear(guess?: number, target?: number): YearStatus {
  if (guess === undefined || target === undefined) return "unknown";
  if (target > guess) return "up";
  if (target < guess) return "down";
  return "match";
}

/**
 * Compara un intento contra el campeón objetivo. Función pura (spec.md §4.4).
 */
export function compareClassic(
  guess: ComparableChampion,
  target: ComparableChampion
): ClassicComparison {
  return {
    gender: equal(guess.gender, target.gender),
    positions: overlap(guess.positions, target.positions),
    species: equal(guess.species, target.species),
    resource: equal(guess.resource, target.resource),
    classes: overlap(guess.classes, target.classes),
    region: equal(guess.region, target.region),
    releaseYear: compareYear(guess.releaseYear, target.releaseYear),
    isCorrect: guess.id === target.id,
  };
}
