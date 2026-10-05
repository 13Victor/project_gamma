/**
 * Tipos de dominio de campeones.
 *
 * Los datos llegan de dos fuentes (ver spec.md §9):
 *  - `src/data/champions.json`        -> Data Dragon, generado por `src/scripts/update-data.ts`
 *  - `src/data/champions-manual.json` -> curado a mano, indexado por `id` de Data Dragon
 * `src/lib/champions.ts` los combina en build.
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

/** Lo que aporta Data Dragon. Generado: no editar a mano. */
export interface ChampionBase {
  /** Id de Data Dragon, estable (ej. "MonkeyKing" para Wukong). Clave del JSON manual y de la URL. */
  id: string;
  /** Clave numérica de Data Dragon, como string. */
  key: string;
  name: string;
  title: string;
  /** URL absoluta del icono (versionada) en el CDN de Data Dragon. */
  imageUrl: string;
  /** Tipo de gama: tags de Data Dragon (Fighter, Tank, Mage...). Puede haber varios. */
  classes: string[];
  /** Recurso (`partype` en Data Dragon): Maná, Energía, Ninguno... */
  resource: string;
}

/** Lo que Data Dragon no da y se mantiene a mano. */
export interface ChampionManual {
  gender: string;
  /** Un campeón puede jugarse en varias posiciones. */
  positions: Position[];
  /** Especie (lore). */
  species: string;
  /** Región (lore). */
  region: string;
  /** Año de lanzamiento. */
  releaseYear: number;
}

export type ChampionsManualData = Record<string, ChampionManual>;

/**
 * Campeón jugable. Los datos manuales son opcionales: mientras no estén
 * rellenados, el juego solo compara lo que sí viene de Data Dragon.
 */
export type Champion = ChampionBase & Partial<ChampionManual>;
