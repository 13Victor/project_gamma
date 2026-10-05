/**
 * Lógica PURA de la ingesta (sin red ni disco), separada de update-data.ts
 * para poder testearla. Se importa con extensión `.ts` porque el script se
 * ejecuta directamente con Node.
 */

/**
 * Clave de comparación para cruzar nombres de fuentes distintas. NO sirve
 * como slug ni para mostrar: "Kai'Sa", "Kaisa" y "KAI SA" dan "kaisa";
 * "Nunu & Willump" da "nunuwillump".
 */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export interface WikiYear {
  /** Nombre tal cual viene en el TXT ("Kai'Sa"). */
  name: string;
  year: number;
}

/**
 * Parsea el TXT de la wiki: una línea por campeón, "Nombre<TAB>Año".
 * Lanza error si una línea está mal formada o si dos nombres colisionan:
 * es preferible fallar a cruzar mal un dato.
 */
export function parseReleaseYears(text: string): Map<string, WikiYear> {
  const result = new Map<string, WikiYear>();
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (line === "") continue;
    const match = /^(.+?)\t+(\d{4})$/.exec(line);
    if (!match) {
      throw new Error(`Línea ${index + 1} del TXT de años mal formada: "${raw}"`);
    }
    const [, name, year] = match;
    const key = normalizeName(name);
    if (result.has(key)) {
      throw new Error(`Nombre repetido en el TXT de años: "${name}"`);
    }
    result.set(key, { name, year: Number(year) });
  }
  return result;
}

export interface MatchResult {
  /** id de Data Dragon -> año. */
  byId: Record<string, number>;
  /** Campeones del juego sin año en el TXT. */
  championsWithoutYear: string[];
  /** Nombres del TXT que no corresponden a ningún campeón. */
  unusedNames: string[];
}

/** Cruza los años del TXT con los campeones, por nombre en inglés normalizado. */
export function matchReleaseYears(
  champions: readonly { id: string; englishName: string }[],
  years: ReadonlyMap<string, WikiYear>
): MatchResult {
  const byId: Record<string, number> = {};
  const championsWithoutYear: string[] = [];
  const used = new Set<string>();

  for (const champion of champions) {
    const key = normalizeName(champion.englishName);
    const entry = years.get(key);
    if (entry) {
      byId[champion.id] = entry.year;
      used.add(key);
    } else {
      championsWithoutYear.push(`${champion.id} ("${champion.englishName}")`);
    }
  }

  const unusedNames = [...years.entries()]
    .filter(([key]) => !used.has(key))
    .map(([, entry]) => entry.name);

  return { byId, championsWithoutYear, unusedNames };
}

/** "kPhysical" -> "physical". Devuelve undefined si no hay dato. */
export function normalizeDamageType(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/^k(?=[A-Z])/, "");
  return cleaned.toLowerCase();
}

/** Histograma de valores, para inspeccionar qué categorías devuelve una fuente. */
export function countValues(
  values: readonly (string | undefined)[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    const key = value ?? "(sin dato)";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([, a], [, b]) => b - a)
  );
}

export interface ActiveOverride {
  id: string;
  field: string;
  /** Valor que dan las fuentes; undefined si la fuente no tiene ese campo. */
  from: unknown;
  to: unknown;
}

/**
 * Lista las correcciones manuales que cambian realmente un dato de las
 * fuentes. Sirve para revisarlas tras cada actualización: si la fuente ya
 * trae el valor corregido, el override sobra y se puede borrar.
 * Ignora los campos que solo existen en el manual (no pisan nada).
 */
export function findActiveOverrides(
  generated: readonly ({ id: string } & Record<string, unknown>)[],
  manual: Readonly<Record<string, Record<string, unknown>>>
): { active: ActiveOverride[]; unknownIds: string[] } {
  const byId = new Map(generated.map((c) => [c.id, c]));
  const active: ActiveOverride[] = [];
  const unknownIds: string[] = [];

  for (const [id, override] of Object.entries(manual)) {
    const source = byId.get(id);
    if (!source) {
      unknownIds.push(id);
      continue;
    }
    for (const [field, to] of Object.entries(override)) {
      const from = source[field];
      if (from !== undefined && JSON.stringify(from) !== JSON.stringify(to)) {
        active.push({ id, field, from, to });
      }
    }
  }
  return { active, unknownIds };
}
