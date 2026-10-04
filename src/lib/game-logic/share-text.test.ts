import { describe, it, expect } from "vitest";
import type { ClassicComparison } from "./classic-compare";
import { buildShareText } from "./share-text";

const miss: ClassicComparison = {
  gender: "match",
  positions: "miss",
  species: "miss",
  resource: "match",
  classes: "miss",
  region: "miss",
  releaseYear: "up",
  isCorrect: false,
};

const win: ClassicComparison = {
  gender: "match",
  positions: "match",
  species: "match",
  resource: "match",
  classes: "match",
  region: "match",
  releaseYear: "match",
  isCorrect: true,
};

describe("buildShareText", () => {
  it("incluye número de reto, nº de intentos y una fila de emojis por intento", () => {
    const text = buildShareText({ challengeNumber: 42, attempts: [miss, win] });
    expect(text.split("\n")).toEqual([
      "Clásico · Reto #42",
      "Intentos: 2",
      "",
      "🟩⬛⬛🟩⬛⬛⬛",
      "🟩🟩🟩🟩🟩🟩🟩",
    ]);
  });

  it("añade la URL al final si se proporciona", () => {
    const text = buildShareText({
      challengeNumber: 1,
      attempts: [win],
      url: "https://ejemplo.com/clasico",
    });
    expect(text.endsWith("\n\nhttps://ejemplo.com/clasico")).toBe(true);
  });
});
