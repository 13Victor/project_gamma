import { describe, it, expect } from "vitest";
import { slugify } from "./utils";

describe("slugify", () => {
  it("quita acentos, apóstrofes y espacios", () => {
    expect(slugify("Kai'Sa")).toBe("kai-sa");
    expect(slugify("Renata Glasc")).toBe("renata-glasc");
    expect(slugify("Nunu y Willump")).toBe("nunu-y-willump");
    expect(slugify("Cho'Gath")).toBe("cho-gath");
  });

  it("normaliza diacríticos", () => {
    expect(slugify("Árbol Ñandú")).toBe("arbol-nandu");
  });
});
