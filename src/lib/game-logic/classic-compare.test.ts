import { describe, it, expect } from "vitest";
import { compareClassic, type ComparableChampion } from "./classic-compare";

function champ(overrides: Partial<ComparableChampion> = {}): ComparableChampion {
  return {
    id: "Ahri",
    gender: "Femenino",
    positions: ["Mid"],
    species: "Vastaya",
    resource: "Maná",
    classes: ["Mage", "Assassin"],
    region: "Ionia",
    releaseYear: 2011,
    ...overrides,
  };
}

describe("compareClassic", () => {
  it("el mismo campeón coincide en todo y es correcto", () => {
    const result = compareClassic(champ(), champ());
    expect(result).toEqual({
      gender: "match",
      positions: "match",
      species: "match",
      resource: "match",
      classes: "match",
      region: "match",
      releaseYear: "match",
      isCorrect: true,
    });
  });

  it("igualdad exacta: género, especie, recurso y región", () => {
    const result = compareClassic(
      champ({ id: "Zed", gender: "Masculino", species: "Humano", resource: "Energía", region: "Ionia" }),
      champ()
    );
    expect(result.gender).toBe("miss");
    expect(result.species).toBe("miss");
    expect(result.resource).toBe("miss");
    expect(result.region).toBe("match");
    expect(result.isCorrect).toBe(false);
  });

  it("posiciones: verde si comparten al menos una", () => {
    const target = champ({ positions: ["Mid", "Top"] });
    expect(compareClassic(champ({ id: "A", positions: ["Top", "Jungla"] }), target).positions).toBe("match");
    expect(compareClassic(champ({ id: "B", positions: ["ADC"] }), target).positions).toBe("miss");
  });

  it("gama: verde si comparten al menos una", () => {
    const target = champ({ classes: ["Mage"] });
    expect(compareClassic(champ({ id: "A", classes: ["Mage", "Support"] }), target).classes).toBe("match");
    expect(compareClassic(champ({ id: "B", classes: ["Tank"] }), target).classes).toBe("miss");
  });

  it("año: flecha ↑ si el objetivo es posterior, ↓ si es anterior", () => {
    const target = champ({ releaseYear: 2015 });
    expect(compareClassic(champ({ id: "A", releaseYear: 2010 }), target).releaseYear).toBe("up");
    expect(compareClassic(champ({ id: "B", releaseYear: 2020 }), target).releaseYear).toBe("down");
    expect(compareClassic(champ({ id: "C", releaseYear: 2015 }), target).releaseYear).toBe("match");
  });

  it("atributos manuales ausentes en alguno de los dos -> unknown", () => {
    const withoutManual = {
      id: "Zed",
      classes: ["Assassin"],
      resource: "Energía",
    };
    const result = compareClassic(withoutManual, champ());
    expect(result.gender).toBe("unknown");
    expect(result.positions).toBe("unknown");
    expect(result.species).toBe("unknown");
    expect(result.region).toBe("unknown");
    expect(result.releaseYear).toBe("unknown");
    // Lo que sí viene de Data Dragon se sigue comparando.
    expect(result.resource).toBe("miss");
    expect(result.classes).toBe("match");
  });

  it("isCorrect depende del id, no de que todos los atributos coincidan", () => {
    const result = compareClassic(champ({ id: "Otro" }), champ());
    expect(result.gender).toBe("match");
    expect(result.releaseYear).toBe("match");
    expect(result.isCorrect).toBe(false);
  });
});
