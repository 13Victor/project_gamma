/**
 * daily-seed.ts
 *
 * Genera un índice determinístico a partir de una fecha, usado para
 * seleccionar el reto del día (campeón, combinación de Grid, etc.)
 * SIN backend ni base de datos.
 *
 * Reglas críticas (no romper sin avisar al resto del equipo/agentes):
 * 1. El "día" se ancla siempre a UTC, nunca a la hora local del dispositivo.
 *    Esto evita que usuarios en distintos husos horarios vean retos distintos
 *    el mismo día civil.
 * 2. Nunca usar Math.random() en esta cadena. Todo debe ser reproducible:
 *    misma fecha => mismo resultado, siempre, en cualquier máquina.
 */

/**
 * Normaliza una fecha a su representación canónica YYYY-MM-DD en UTC.
 * Ignora la hora, minutos, etc. — solo nos interesa el día civil.
 */
export function toUTCDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Hash determinístico simple (djb2) de un string a un entero de 32 bits.
 * No es criptográfico — no lo necesitamos. Solo buscamos una distribución
 * razonablemente uniforme a partir de la fecha.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Forzamos a entero sin signo de 32 bits
  return hash >>> 0;
}

/**
 * PRNG determinístico (mulberry32). Dado un seed numérico, genera
 * una secuencia reproducible de números en [0, 1).
 * No se usa para criptografía, solo para "barajar" el índice con
 * buena distribución a partir del hash de la fecha.
 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Devuelve un índice determinístico en el rango [0, arrayLength) para
 * una fecha y un "namespace" dados.
 *
 * El namespace permite que distintos modos de juego (clasico, grid, items...)
 * usando la MISMA fecha obtengan índices DISTINTOS entre sí, evitando que
 * el campeón del modo Clásico y la primera pieza del Grid coincidan siempre
 * por usar la misma semilla cruda.
 *
 * @param date       Fecha del reto (normalmente "hoy")
 * @param arrayLength Longitud del array sobre el que se calcula el índice
 * @param namespace  Identificador del modo de juego, ej. "clasico", "grid"
 */
export function getDailyIndex(
  date: Date,
  arrayLength: number,
  namespace: string
): number {
  if (arrayLength <= 0) {
    throw new Error("getDailyIndex: arrayLength debe ser mayor que 0");
  }

  const dateString = toUTCDateString(date);
  const seedString = `${dateString}:${namespace}`;
  const seed = djb2Hash(seedString);
  const rng = mulberry32(seed);

  // Descartamos el primer valor generado por el PRNG con este seed
  // concreto suele mejorar la distribución en la práctica.
  rng();

  return Math.floor(rng() * arrayLength);
}

/**
 * Devuelve el número de "día de reto" desde una fecha de referencia
 * (útil para mostrar "Reto #123" en la UI y en el share result).
 */
const EPOCH_START_UTC = Date.UTC(2026, 6, 1); // 1 de julio de 2026 — ajustar al día de lanzamiento real

export function getChallengeNumber(date: Date): number {
  const current = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const diffMs = current - EPOCH_START_UTC;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}