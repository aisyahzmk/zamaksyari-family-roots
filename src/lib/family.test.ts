import { describe, expect, it } from "vitest";
import { FamilyModel, RAW_PEOPLE } from "./family";

const m = new FamilyModel(RAW_PEOPLE);

describe("family model", () => {
  it("Ayah and Ibu have six children", () => {
    expect(m.getChildren(m.getById("p1")!)).toHaveLength(6);
  });
  it("Ateh has five siblings", () => {
    expect(m.getSiblings(m.getById("p5")!)).toHaveLength(5);
  });
  it("counts two generations, 3 male and 5 female", () => {
    const s = m.getStats();
    expect(s.generations).toBe(2);
    expect(s.male).toBe(3);
    expect(s.female).toBe(5);
  });
  it("search matches profession and gender filter", () => {
    expect(m.search("student", "male").map((p) => p.id)).toEqual(["p7"]);
  });
});
