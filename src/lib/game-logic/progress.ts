/**
 * Lógica pura de progreso por modo: rachas, estadísticas e intentos del día.
 * El store de Zustand solo envuelve estas funciones y las persiste.
 * Todas las fechas son strings YYYY-MM-DD en UTC (ver `toUTCDateString`).
 */

export interface ModeProgress {
  currentStreak: number;
  maxStreak: number;
  /** Partidas empezadas (se cuenta al hacer el primer intento del día). */
  played: number;
  won: number;
  /** Nº de intentos hasta acertar -> veces. Ej. { "3": 2, "7": 1 }. */
  attemptsDistribution: Record<string, number>;
  /** Último día (UTC) en que se acertó el reto. Sirve también para saber si hoy ya está resuelto. */
  lastCompletedDate: string | null;
  /** Día (UTC) al que pertenecen `dayAttempts`. */
  dayDate: string | null;
  /** Ids de campeón intentados en la partida de `dayDate`, en orden. */
  dayAttempts: string[];
}

export function emptyProgress(): ModeProgress {
  return {
    currentStreak: 0,
    maxStreak: 0,
    played: 0,
    won: 0,
    attemptsDistribution: {},
    lastCompletedDate: null,
    dayDate: null,
    dayAttempts: [],
  };
}

/** Día civil UTC anterior a `dateString` (YYYY-MM-DD). */
export function previousUTCDateString(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** Si ha cambiado el día, descarta los intentos del día anterior. */
export function syncDay(progress: ModeProgress, today: string): ModeProgress {
  if (progress.dayDate === today) return progress;
  return { ...progress, dayDate: today, dayAttempts: [] };
}

export function isCompletedToday(
  progress: ModeProgress,
  today: string
): boolean {
  return progress.lastCompletedDate === today;
}

/**
 * Registra un intento. Ignora el intento si hoy ya está resuelto o si el
 * campeón ya se había intentado.
 */
export function addAttempt(
  progress: ModeProgress,
  today: string,
  championId: string,
  isCorrect: boolean
): ModeProgress {
  const current = syncDay(progress, today);
  if (isCompletedToday(current, today)) return current;
  if (current.dayAttempts.includes(championId)) return current;

  const dayAttempts = [...current.dayAttempts, championId];
  const next: ModeProgress = {
    ...current,
    dayAttempts,
    played: current.played + (current.dayAttempts.length === 0 ? 1 : 0),
  };
  if (!isCorrect) return next;

  const continuesStreak =
    current.lastCompletedDate === previousUTCDateString(today);
  const currentStreak = continuesStreak ? current.currentStreak + 1 : 1;
  const key = String(dayAttempts.length);

  return {
    ...next,
    won: current.won + 1,
    currentStreak,
    maxStreak: Math.max(current.maxStreak, currentStreak),
    lastCompletedDate: today,
    attemptsDistribution: {
      ...current.attemptsDistribution,
      [key]: (current.attemptsDistribution[key] ?? 0) + 1,
    },
  };
}

/**
 * Racha a mostrar hoy: si no se resolvió ni ayer ni hoy, la racha guardada
 * ya está rota aunque el valor persistido todavía no se haya puesto a 0.
 */
export function getDisplayStreak(
  progress: ModeProgress,
  today: string
): number {
  const last = progress.lastCompletedDate;
  if (last === today || last === previousUTCDateString(today)) {
    return progress.currentStreak;
  }
  return 0;
}
