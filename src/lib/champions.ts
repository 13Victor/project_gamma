import championsJson from "../data/champions.json";
import manualJson from "../data/champions-manual.json";
import type {
  Champion,
  ChampionBase,
  ChampionsManualData,
} from "../types/champion";

const base = championsJson as unknown as ChampionBase[];
const manual = manualJson as unknown as ChampionsManualData;

/**
 * Combina Data Dragon + datos manuales (si los hay para ese campeón).
 *
 * Orden estable por `id`: el reto diario indexa este array, así que el
 * orden NO puede depender del orden de llegada de Data Dragon.
 */
const champions: Champion[] = base
  .map((c): Champion => ({ ...c, ...manual[c.id] }))
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

export function getPlayableChampions(): Champion[] {
  return champions;
}

export function getChampionById(id: string): Champion | undefined {
  return champions.find((c) => c.id === id);
}
