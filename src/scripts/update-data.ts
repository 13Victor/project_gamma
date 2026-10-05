/**
 * update-data.ts — ingesta de fuentes externas (ver docs/fuentes-de-datos.md).
 *
 *   npm run data:update
 *
 * Genera `src/data/champions.json` (NUNCA editar a mano) combinando:
 *   1. Data Dragon      (Riot, oficial)  -> id, key, nombre, imagen, gama, recurso
 *   2. CommunityDragon  (comunidad)      -> shortBio, tipo de daño/ataque, tags
 *   3. TXT de la wiki   (a mano, en repo) -> año de lanzamiento
 * Lo que haya en `champions-manual.json` se aplica después, al cargar, y gana.
 *
 * Cruces: Data Dragon `key` == CommunityDragon `id` (numérico). El TXT de la
 * wiki usa el nombre EN INGLÉS ("Kai'Sa", "Nunu & Willump"), que sale del
 * `name` del idioma por defecto de CommunityDragon, nunca del nombre
 * localizado ("Nunu y Willump") ni del id ("Kaisa").
 *
 * Variables opcionales: CDRAGON_PATCH (por defecto "latest"; también vale "15.20").
 * Node >= 22.18: ejecuta TypeScript directamente, por eso este script no usa
 * alias `@/` y los imports llevan extensión.
 */
import { readFile, writeFile } from "node:fs/promises";
import type { ChampionBase, ChampionsManualData } from "../types/champion.ts";
import {
  countValues,
  findActiveOverrides,
  matchReleaseYears,
  normalizeDamageType,
  parseReleaseYears,
} from "./merge-sources.ts";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const DD_LOCALE = "es_ES";
const CDRAGON_PATCH = process.env.CDRAGON_PATCH ?? "latest";
const CDRAGON = `https://raw.communitydragon.org/${CDRAGON_PATCH}/plugins/rcp-be-lol-game-data/global`;
const CD_LOCALE = "es_es";
const CONCURRENCY = 8;
const DATA_DIR = new URL("../data/", import.meta.url);

interface DDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  partype: string;
  image: { full: string };
}

interface CDragonSummaryEntry {
  id: number;
  name: string;
  alias: string;
}

interface CDragonChampion {
  shortBio?: string;
  tacticalInfo?: { damageType?: string; attackType?: string };
  championTagInfo?: {
    championTagPrimary?: string;
    championTagSecondary?: string;
  };
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} -> ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/** Ejecuta `task` sobre todos los items con un máximo de `limit` a la vez. */
async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function section(title: string, lines: string[]) {
  if (lines.length === 0) return;
  console.warn(`\n${title}\n  ${lines.join("\n  ")}`);
}

async function main() {
  // --- 1. Data Dragon -------------------------------------------------------
  const versions = await getJson<string[]>(`${DDRAGON}/api/versions.json`);
  const version = versions[0];
  console.log(`Data Dragon ${version} (${DD_LOCALE}) · CommunityDragon ${CDRAGON_PATCH}`);

  const { data } = await getJson<{ data: Record<string, DDragonChampion> }>(
    `${DDRAGON}/cdn/${version}/data/${DD_LOCALE}/champion.json`
  );
  const ddragon = Object.values(data);

  // --- 2. CommunityDragon ---------------------------------------------------
  // Nombres en inglés (idioma por defecto), un solo fichero.
  const summary = await getJson<CDragonSummaryEntry[]>(
    `${CDRAGON}/default/v1/champion-summary.json`
  );
  const englishNameById = new Map(summary.map((entry) => [entry.id, entry.name]));

  // Detalle por campeón (en español): bio corta, tipo de daño/ataque y tags.
  const failures: string[] = [];
  const details = await mapPool(ddragon, CONCURRENCY, async (champion) => {
    try {
      return await getJson<CDragonChampion>(
        `${CDRAGON}/${CD_LOCALE}/v1/champions/${champion.key}.json`
      );
    } catch (error) {
      failures.push(`${champion.id}: ${(error as Error).message}`);
      return undefined;
    }
  });

  const missingEnglishName: string[] = [];
  const champions: ChampionBase[] = ddragon.map((champion, index) => {
    const detail = details[index];
    const englishName = englishNameById.get(Number(champion.key));
    if (englishName === undefined) missingEnglishName.push(champion.id);

    return {
      id: champion.id,
      key: champion.key,
      name: champion.name,
      title: champion.title,
      imageUrl: `${DDRAGON}/cdn/${version}/img/champion/${champion.image.full}`,
      classes: champion.tags,
      resource: champion.partype,
      englishName: englishName ?? champion.name,
      shortBio: detail?.shortBio,
      damageType: normalizeDamageType(detail?.tacticalInfo?.damageType),
      attackType: detail?.tacticalInfo?.attackType?.toLowerCase(),
      tagPrimary: detail?.championTagInfo?.championTagPrimary,
      tagSecondary: detail?.championTagInfo?.championTagSecondary,
    };
  });

  // --- 3. Años de la wiki ---------------------------------------------------
  const years = parseReleaseYears(
    await readFile(new URL("sources/champion-release-years.txt", DATA_DIR), "utf8")
  );
  const match = matchReleaseYears(champions, years);
  for (const champion of champions) {
    champion.releaseYear = match.byId[champion.id];
  }

  // --- Salida (orden estable por id: los diffs en git solo muestran cambios reales)
  champions.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  await writeFile(
    new URL("champions.json", DATA_DIR),
    JSON.stringify(champions, null, 2) + "\n"
  );
  console.log(`champions.json: ${champions.length} campeones`);

  // --- Informe --------------------------------------------------------------
  section(`CommunityDragon: ${failures.length} fallos (esos campeones quedan sin esos datos):`, failures);
  section("Sin nombre en inglés en CommunityDragon (no se podrá cruzar su año):", missingEnglishName);
  section("Campeones SIN año en el TXT (añádelo al TXT o a champions-manual.json):", match.championsWithoutYear);
  section("Nombres del TXT que no corresponden a ningún campeón:", match.unusedNames);

  console.log("\nValores encontrados (revisa que las categorías sean las esperadas):");
  console.log("  damageType:", countValues(champions.map((c) => c.damageType)));
  console.log("  attackType:", countValues(champions.map((c) => c.attackType)));
  console.log("  tagPrimary:", countValues(champions.map((c) => c.tagPrimary)));
  console.log("  tagSecondary:", countValues(champions.map((c) => c.tagSecondary)));
  console.log("  resource:", countValues(champions.map((c) => c.resource)));

  // --- Correcciones manuales ------------------------------------------------
  const manual = JSON.parse(
    await readFile(new URL("champions-manual.json", DATA_DIR), "utf8")
  ) as ChampionsManualData;
  const { active, unknownIds } = findActiveOverrides(
    champions as unknown as ({ id: string } & Record<string, unknown>)[],
    manual
  );
  section(
    "Ids de champions-manual.json que no existen (¿mal escritos o campeón retirado?):",
    unknownIds
  );
  section(
    "Correcciones manuales activas (si la fuente ya trae el valor correcto, bórralas):",
    active.map(
      (o) => `${o.id}.${o.field}: ${JSON.stringify(o.from)} -> ${JSON.stringify(o.to)}`
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
