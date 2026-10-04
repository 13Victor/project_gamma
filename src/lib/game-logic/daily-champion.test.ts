import { describe, it, expect } from "vitest";
import { getDailyChampion } from "./daily-champion";

const roster = ["Ahri", "Zed", "Lux", "Jinx", "Garen", "Teemo"].map((id) => ({ id }));

describe("getDailyChampion", () => {
  const date = new Date(Date.UTC(2026, 6, 12));

  it("es determinístico para la misma fecha", () => {
    expect(getDailyChampion(date, roster)).toEqual(getDailyChampion(date, roster));
  });

  it("no depende del orden de la lista de entrada", () => {
    const shuffled = [...roster].reverse();
    expect(getDailyChampion(date, shuffled)).toEqual(getDailyChampion(date, roster));
  });

  it("devuelve siempre un campeón de la lista", () => {
    for (let day = 1; day <= 30; day++) {
      const champion = getDailyChampion(new Date(Date.UTC(2026, 6, day)), roster);
      expect(roster).toContainEqual(champion);
    }
  });

  it("lanza error con una lista vacía", () => {
    expect(() => getDailyChampion(date, [])).toThrow();
  });
});
