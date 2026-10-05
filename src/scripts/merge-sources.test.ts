import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  countValues,
  findActiveOverrides,
  matchReleaseYears,
  normalizeDamageType,
  normalizeName,
  parseReleaseYears,
} from "./merge-sources";

const txt = readFileSync(
  new URL("../data/sources/champion-release-years.txt", import.meta.url),
  "utf8"
);

describe("normalizeName", () => {
  it("iguala las distintas formas de escribir el mismo nombre", () => {
    expect(normalizeName("Kai'Sa")).toBe("kaisa");
    expect(normalizeName("Kaisa")).toBe("kaisa");
    expect(normalizeName("Nunu & Willump")).toBe("nunuwillump");
    expect(normalizeName("Dr. Mundo")).toBe("drmundo");
    expect(normalizeName("Renata Glasc")).toBe("renataglasc");
    expect(normalizeName("Jarvan IV")).toBe("jarvaniv");
  });
});

describe("parseReleaseYears (TXT real de la wiki)", () => {
  const years = parseReleaseYears(txt);

  it("lee los 173 campeones sin colisiones de nombre", () => {
    expect(years.size).toBe(173);
  });

  it("todos los años son plausibles", () => {
    for (const { year } of years.values()) {
      expect(year).toBeGreaterThanOrEqual(2009);
      expect(year).toBeLessThanOrEqual(2026);
    }
  });

  it("incluye los nombres con caracteres especiales tal cual los devuelve CommunityDragon (idioma por defecto)", () => {
    const englishNamesFromCommunityDragon = [
      "Wukong", "Nunu & Willump", "Kai'Sa", "Kha'Zix", "Renata Glasc",
      "Dr. Mundo", "Jarvan IV", "LeBlanc", "Fiddlesticks", "Bel'Veth",
      "K'Sante", "Aurelion Sol", "Cho'Gath", "Vel'Koz", "Rek'Sai",
      "Kog'Maw", "Xin Zhao", "Lee Sin", "Master Yi", "Miss Fortune",
      "Tahm Kench", "Twisted Fate", "Mel", "Yunara", "Zaahen", "Locke",
      "Ambessa", "Aurora", "Smolder",
    ];
    for (const name of englishNamesFromCommunityDragon) {
      expect(years.get(normalizeName(name)), name).toBeDefined();
    }
  });

  it("falla con líneas mal formadas o nombres repetidos", () => {
    expect(() => parseReleaseYears("Ahri 2011")).toThrow(/mal formada/);
    expect(() => parseReleaseYears("Ahri\t2011\nAhri\t2012")).toThrow(/repetido/);
    expect(() => parseReleaseYears("Kai'Sa\t2018\nKaisa\t2018")).toThrow(/repetido/);
  });
});

describe("matchReleaseYears", () => {
  const years = parseReleaseYears("Kai'Sa\t2018\nAhri\t2011\nFantasma\t2030");

  it("cruza por nombre en inglés, no por id ni por nombre localizado", () => {
    const result = matchReleaseYears(
      [
        { id: "Kaisa", englishName: "Kai'Sa" },
        { id: "Ahri", englishName: "Ahri" },
        { id: "Nuevo", englishName: "Nuevo" },
      ],
      years
    );
    expect(result.byId).toEqual({ Kaisa: 2018, Ahri: 2011 });
    expect(result.championsWithoutYear).toEqual(['Nuevo ("Nuevo")']);
    expect(result.unusedNames).toEqual(["Fantasma"]);
  });
});

describe("normalizeDamageType", () => {
  it("quita el prefijo k de la fuente", () => {
    expect(normalizeDamageType("kPhysical")).toBe("physical");
    expect(normalizeDamageType("kMagic")).toBe("magic");
    expect(normalizeDamageType("kMixed")).toBe("mixed");
  });
  it("devuelve undefined sin dato y no rompe valores sin prefijo", () => {
    expect(normalizeDamageType(undefined)).toBeUndefined();
    expect(normalizeDamageType("")).toBeUndefined();
    expect(normalizeDamageType("Magic")).toBe("magic");
  });
});

describe("countValues", () => {
  it("cuenta y ordena de mayor a menor, marcando los que faltan", () => {
    expect(countValues(["melee", "ranged", "melee", undefined])).toEqual({
      melee: 2,
      ranged: 1,
      "(sin dato)": 1,
    });
  });
});

describe("findActiveOverrides", () => {
  const generated = [
    { id: "Aatrox", resource: "Pozo de Sangre", releaseYear: 2013 },
    { id: "Ahri", resource: "Maná" },
  ];

  it("lista solo las correcciones que cambian un dato de las fuentes", () => {
    const { active, unknownIds } = findActiveOverrides(generated, {
      Aatrox: { resource: "Ninguno", releaseYear: 2013, gender: "Masculino" },
      Ahri: { species: "Vastaya" },
    });
    expect(active).toEqual([
      { id: "Aatrox", field: "resource", from: "Pozo de Sangre", to: "Ninguno" },
    ]);
    expect(unknownIds).toEqual([]);
  });

  it("detecta ids manuales que ya no existen", () => {
    const { unknownIds } = findActiveOverrides(generated, { Fantasma: { gender: "x" } });
    expect(unknownIds).toEqual(["Fantasma"]);
  });
});
