/**
 * Tipos de dominio de campeones.
 *
 * Los datos se montan en CAPAS; la de más abajo la pisa la de más arriba
 * (ver docs/fuentes-de-datos.md):
 *
 *   1. Data Dragon      -> id, key, name, title, imageUrl, classes, resource
 *   2. CommunityDragon  -> shortBio, damageType, attackType, tagPrimary, tagSecondary
 *   3. Wiki (TXT)       -> releaseYear
 *      └ 1-3 = `src/data/champions.json`, GENERADO por `src/scripts/update-data.ts`
 *   4. Manual           -> `src/data/champions-manual.json`, SIEMPRE gana:
 *                          añade lo que ninguna fuente da (género, posiciones,
 *                          especie, región) y corrige cualquier campo de las capas 1-3.
 *
 * `src/lib/champions.ts` aplica la capa 4 al cargar.
 */

export const POSITIONS = ["Top", "Jungla", "Mid", "ADC", "Soporte"] as const;
export type Position = (typeof POSITIONS)[number];

/** Etiquetas (tags) de Data Dragon -> texto en español para la UI. */
export const CLASS_LABELS: Record<string, string> = {
  Fighter: "Luchador",
  Tank: "Tanque",
  Mage: "Mago",
  Assassin: "Asesino",
  Marksman: "Tirador",
  Support: "Soporte",
};

/** Capas 1-3. Generado: no editar a mano (para corregir algo, usa la capa manual). */
export interface ChampionBase {
  // --- Data Dragon ---
  /** Id de Data Dragon, estable (ej. "MonkeyKing" para Wukong). Clave del JSON manual y de la URL. */
  id: string;
  /** Clave numérica, como string. Es el id numérico de CommunityDragon: así se cruzan las dos fuentes. */
  key: string;
  /** Nombre para mostrar (en español). */
  name: string;
  title: string;
  /** URL absoluta del icono (versionada) en el CDN de Data Dragon. */
  imageUrl: string;
  /** Tipo de gama: tags de Data Dragon (Fighter, Tank, Mage...). Puede haber varios. */
  classes: string[];
  /** Recurso (`partype` en Data Dragon): Maná, Energía, Pozo de sangre... */
  resource: string;

  // --- CommunityDragon ---
  /** Nombre en inglés tal cual lo escribe la wiki ("Kai'Sa", "Nunu & Willump"). Solo para cruzar con fuentes externas. */
  englishName: string;
  shortBio?: string;
  /** "physical" | "magic" | "mixed"... (sin el prefijo "k" de la fuente). */
  damageType?: string;
  /** "melee" | "ranged". */
  attackType?: string;
  /** Etiqueta principal de estilo de juego (texto localizado: "Daño continuo"). */
  tagPrimary?: string;
  tagSecondary?: string;

  // --- Wiki ---
  releaseYear?: number;
}

/** Datos que ninguna fuente aporta: solo existen en el JSON manual. */
export interface ChampionManualOnly {
  gender: string;
  /** Un campeón puede jugarse en varias posiciones. */
  positions: Position[];
  /** Especie (lore). */
  species: string;
  /** Región (lore). */
  region: string;
}

/**
 * Una entrada del JSON manual: cualquier campo (menos id y key) de las capas
 * 1-3 y de `ChampionManualOnly`, todos opcionales. Lo que pongas aquí gana.
 */
export type ChampionOverride = Partial<Omit<ChampionBase, "id" | "key">> &
  Partial<ChampionManualOnly>;

export type ChampionsManualData = Record<string, ChampionOverride>;

/** Campeón jugable: todo opcional salvo lo que siempre da Data Dragon. */
export type Champion = ChampionBase & Partial<ChampionManualOnly>;
