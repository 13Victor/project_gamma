import { describe, it, expect } from "vitest";
import { toUTCDateString, getDailyIndex, getChallengeNumber } from "./daily-seed";

describe("toUTCDateString", () => {
  it("formatea correctamente una fecha UTC", () => {
    const date = new Date(Date.UTC(2026, 6, 12)); // 12 julio 2026
    expect(toUTCDateString(date)).toBe("2026-07-12");
  });

  it("ignora la hora local, solo importa el día UTC", () => {
    const morning = new Date(Date.UTC(2026, 6, 12, 0, 1));
    const night = new Date(Date.UTC(2026, 6, 12, 23, 59));
    expect(toUTCDateString(morning)).toBe(toUTCDateString(night));
  });
});

describe("getDailyIndex", () => {
  const arrayLength = 170; // aprox nº de campeones actuales

  it("es determinístico: misma fecha y namespace => mismo índice siempre", () => {
    const date = new Date(Date.UTC(2026, 6, 12));
    const first = getDailyIndex(date, arrayLength, "clasico");
    const second = getDailyIndex(date, arrayLength, "clasico");
    expect(first).toBe(second);
  });

  it("devuelve índices distintos para fechas distintas (en la mayoría de casos)", () => {
    const day1 = getDailyIndex(new Date(Date.UTC(2026, 6, 12)), arrayLength, "clasico");
    const day2 = getDailyIndex(new Date(Date.UTC(2026, 6, 13)), arrayLength, "clasico");
    const day3 = getDailyIndex(new Date(Date.UTC(2026, 6, 14)), arrayLength, "clasico");
    // No exigimos que TODOS sean distintos entre sí (con arrayLength finito
    // puede haber colisión ocasional), pero sí que no sean siempre iguales.
    const allEqual = day1 === day2 && day2 === day3;
    expect(allEqual).toBe(false);
  });

  it("distintos namespaces dan distinto índice para la misma fecha (normalmente)", () => {
    const date = new Date(Date.UTC(2026, 6, 12));
    const clasico = getDailyIndex(date, arrayLength, "clasico");
    const grid = getDailyIndex(date, arrayLength, "grid");
    // No es una garantía matemática absoluta, pero con namespaces distintos
    // como parte del seed, una coincidencia constante indicaría un bug.
    expect(clasico === grid).toBe(false);
  });

  it("siempre devuelve un índice dentro del rango válido", () => {
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.UTC(2026, 6, i + 1));
      const index = getDailyIndex(date, arrayLength, "clasico");
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(arrayLength);
    }
  });

  it("lanza error si arrayLength es 0 o negativo", () => {
    const date = new Date(Date.UTC(2026, 6, 12));
    expect(() => getDailyIndex(date, 0, "clasico")).toThrow();
    expect(() => getDailyIndex(date, -5, "clasico")).toThrow();
  });
});

describe("getChallengeNumber", () => {
  it("da un número consistente para la misma fecha", () => {
    const date = new Date(Date.UTC(2026, 6, 12));
    expect(getChallengeNumber(date)).toBe(getChallengeNumber(date));
  });

  it("incrementa en 1 al pasar un día", () => {
    const day1 = new Date(Date.UTC(2026, 6, 12));
    const day2 = new Date(Date.UTC(2026, 6, 13));
    expect(getChallengeNumber(day2)).toBe(getChallengeNumber(day1) + 1);
  });
});