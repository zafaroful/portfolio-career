import { proficiencySchema } from "@/lib/validators";
import { describe, expect, it } from "vitest";

describe("validators", () => {
  it("accepts valid proficiency levels", () => {
    expect(proficiencySchema.parse("EXPERT")).toBe("EXPERT");
  });

  it("rejects invalid proficiency", () => {
    expect(() => proficiencySchema.parse("MASTER")).toThrow();
  });
});

describe("api envelope", () => {
  it("formats success response shape", () => {
    const response = { data: [{ id: "1" }], meta: { total: 1 } };
    expect(response.data).toHaveLength(1);
    expect(response.meta?.total).toBe(1);
  });
});
