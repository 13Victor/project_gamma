import { CLASSIC_ATTRIBUTES, type ClassicComparison } from "./classic-compare";

/**
 * Texto para compartir al acertar (spec.md §6). Una fila por intento, una
 * casilla por atributo: 🟩 si coincide, ⬛ si no (las flechas del año cuentan
 * como ⬛). No revela el campeón objetivo.
 */
export function buildShareText(params: {
  challengeNumber: number;
  attempts: readonly ClassicComparison[];
  /** Si se pasa, se añade al final como enlace de vuelta al juego. */
  url?: string;
}): string {
  const { challengeNumber, attempts, url } = params;
  const rows = attempts.map((attempt) =>
    CLASSIC_ATTRIBUTES.map((key) =>
      attempt[key] === "match" ? "🟩" : "⬛"
    ).join("")
  );

  const lines = [
    `Clásico · Reto #${challengeNumber}`,
    `Intentos: ${attempts.length}`,
    "",
    ...rows,
  ];
  if (url) lines.push("", url);
  return lines.join("\n");
}
