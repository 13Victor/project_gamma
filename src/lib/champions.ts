import championsJson from "../data/champions.json";
import manualJson from "../data/champions-manual.json";
import type {
  Champion,
  ChampionBase,
  ChampionsManualData,
} from "../types/champion";
import { slugify } from "./utils";

const base = championsJson as unknown as ChampionBase[];
const manual = manualJson as unknown as ChampionsManualData;

/**
 * Combina Data Dragon + datos manuales. Un campeón solo es "jugable" si
 * tiene entrada manual; los que no la tengan se ignoran (el script de
 * ingesta avisa de cuáles faltan).
 *
 * Orden estable por `id`: el reto diario indexa este array, así que el
 * orden NO puede depender del orden de llegada de Data Dragon.
 */
function buildChampions(): Champion[] {
  return base
    .filter((c) => manual[c.id] !== undefined)
    .map((c) => ({ ...c, ...manual[c.id], slug: slugify(c.name) }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

const champions = buildChampions();

export function getPlayableChampions(): Champion[] {
  return champions;
}

export function getChampionBySlug(slug: string): Champion | undefined {
  return champions.find((c) => c.slug === slug);
}
