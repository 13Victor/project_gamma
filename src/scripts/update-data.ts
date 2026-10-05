/**
 * update-data.ts — ingesta de Data Dragon (spec.md §9).
 *
 *   npm run data:update
 *
 * Genera `src/data/champions.json` (NUNCA editar a mano). Es el único sitio
 * del proyecto que habla con Data Dragon; ni el cliente ni el servidor lo
 * llaman en ejecución.
 *
 * Al terminar avisa de qué campeones no tienen entrada en
 * `src/data/champions-manual.json` (esos no serán jugables) y de qué
 * entradas manuales no corresponden a ningún campeón.
 *
 * Se ejecuta con Node (>= 22.18 / 24) directamente sobre TypeScript, por eso
 * el script es autocontenido: sin alias `@/` ni imports sin extensión.
 */
import { readFile, writeFile } from "node:fs/promises";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const LOCALE = "es_ES";
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

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} -> ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

async function main() {
  const versions = await getJson<string[]>(`${DDRAGON}/api/versions.json`);
  const version = versions[0];
  console.log(`Data Dragon ${version} (${LOCALE})`);

  const { data } = await getJson<{ data: Record<string, DDragonChampion> }>(
    `${DDRAGON}/cdn/${version}/data/${LOCALE}/champion.json`
  );

  const champions = Object.values(data)
    .map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      title: c.title,
      imageUrl: `${DDRAGON}/cdn/${version}/img/champion/${c.image.full}`,
      classes: c.tags,
      // "Sin coste" / "Ninguno" según el locale; se deja tal cual viene.
      resource: c.partype,
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  await writeFile(
    new URL("champions.json", DATA_DIR),
    JSON.stringify(champions, null, 2) + "\n"
  );
  console.log(`champions.json: ${champions.length} campeones`);

  const manual = JSON.parse(
    await readFile(new URL("champions-manual.json", DATA_DIR), "utf8")
  ) as Record<string, unknown>;

  const ids = new Set(champions.map((c) => c.id));
  const missing = champions.filter((c) => !(c.id in manual)).map((c) => c.id);
  const orphan = Object.keys(manual).filter((id) => !ids.has(id));

  if (missing.length > 0) {
    console.warn(
      `\n${missing.length} campeones SIN datos manuales (se juegan igualmente, pero solo con gama y recurso):\n  ${missing.join(", ")}`
    );
  }
  if (orphan.length > 0) {
    console.warn(
      `\n${orphan.length} entradas manuales sin campeón en Data Dragon (¿id mal escrito?):\n  ${orphan.join(", ")}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
