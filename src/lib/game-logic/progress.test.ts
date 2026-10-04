import { describe, it, expect } from "vitest";
import {
  addAttempt,
  emptyProgress,
  getDisplayStreak,
  isCompletedToday,
  previousUTCDateString,
  syncDay,
} from "./progress";

describe("previousUTCDateString", () => {
  it("resta un día, incluso cruzando mes y año", () => {
    expect(previousUTCDateString("2026-07-12")).toBe("2026-07-11");
    expect(previousUTCDateString("2026-08-01")).toBe("2026-07-31");
    expect(previousUTCDateString("2027-01-01")).toBe("2026-12-31");
  });
});

describe("syncDay", () => {
  it("descarta los intentos si cambia el día", () => {
    let p = addAttempt(emptyProgress(), "2026-07-12", "Ahri", false);
    p = syncDay(p, "2026-07-13");
    expect(p.dayDate).toBe("2026-07-13");
    expect(p.dayAttempts).toEqual([]);
  });

  it("conserva los intentos si es el mismo día", () => {
    const p = addAttempt(emptyProgress(), "2026-07-12", "Ahri", false);
    expect(syncDay(p, "2026-07-12")).toBe(p);
  });
});

describe("addAttempt", () => {
  it("cuenta la partida jugada solo en el primer intento del día", () => {
    let p = addAttempt(emptyProgress(), "2026-07-12", "Ahri", false);
    p = addAttempt(p, "2026-07-12", "Zed", false);
    expect(p.played).toBe(1);
    expect(p.dayAttempts).toEqual(["Ahri", "Zed"]);
  });

  it("ignora intentos repetidos", () => {
    let p = addAttempt(emptyProgress(), "2026-07-12", "Ahri", false);
    p = addAttempt(p, "2026-07-12", "Ahri", false);
    expect(p.dayAttempts).toEqual(["Ahri"]);
  });

  it("al acertar actualiza victorias, racha, distribución y día completado", () => {
    let p = addAttempt(emptyProgress(), "2026-07-12", "Ahri", false);
    p = addAttempt(p, "2026-07-12", "Zed", true);
    expect(p.won).toBe(1);
    expect(p.currentStreak).toBe(1);
    expect(p.maxStreak).toBe(1);
    expect(p.attemptsDistribution).toEqual({ "2": 1 });
    expect(isCompletedToday(p, "2026-07-12")).toBe(true);
  });

  it("no admite más intentos una vez resuelto el día", () => {
    let p = addAttempt(emptyProgress(), "2026-07-12", "Zed", true);
    const before = p;
    p = addAttempt(p, "2026-07-12", "Ahri", false);
    expect(p).toBe(before);
  });

  it("la racha sigue si se acertó ayer y se reinicia si hay un hueco", () => {
    let p = addAttempt(emptyProgress(), "2026-07-12", "A", true);
    p = addAttempt(p, "2026-07-13", "B", true);
    expect(p.currentStreak).toBe(2);
    p = addAttempt(p, "2026-07-15", "C", true); // se saltó el 14
    expect(p.currentStreak).toBe(1);
    expect(p.maxStreak).toBe(2);
  });
});

describe("getDisplayStreak", () => {
  it("muestra la racha si se resolvió hoy o ayer, 0 si se rompió", () => {
    const p = addAttempt(emptyProgress(), "2026-07-12", "A", true);
    expect(getDisplayStreak(p, "2026-07-12")).toBe(1);
    expect(getDisplayStreak(p, "2026-07-13")).toBe(1);
    expect(getDisplayStreak(p, "2026-07-14")).toBe(0);
  });
});
