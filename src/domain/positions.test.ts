import { describe, expect, it } from "vite-plus/test";
import { normalizePosition } from "./positions";
import { regionForConfederation } from "./regions";

describe("normalizePosition", () => {
  it("maps common source labels to fantasy positions", () => {
    expect(normalizePosition("Goalkeeper")).toBe("GK");
    expect(normalizePosition("GK")).toBe("GK");
    expect(normalizePosition("DF")).toBe("DEF");
    expect(normalizePosition("Centre-Back")).toBe("DEF");
    expect(normalizePosition("MF")).toBe("MID");
    expect(normalizePosition("Defensive Midfielder")).toBe("MID");
    expect(normalizePosition("FW")).toBe("FWD");
    expect(normalizePosition("Striker")).toBe("FWD");
    expect(normalizePosition("winger")).toBe("FWD");
  });

  it("is case- and whitespace-insensitive", () => {
    expect(normalizePosition("  goalkeeper  ")).toBe("GK");
    expect(normalizePosition("DEFENDER")).toBe("DEF");
  });

  it("returns null for unmappable labels so importers can flag them", () => {
    expect(normalizePosition("Libero-Sweeper-Hybrid")).toBeNull();
    expect(normalizePosition("")).toBeNull();
  });
});

describe("regionForConfederation", () => {
  it("maps CONCACAF to the North/Central America & Caribbean bucket", () => {
    expect(regionForConfederation("CONCACAF")).toBe("North/Central America & Caribbean");
  });

  it("maps the remaining confederations deterministically", () => {
    expect(regionForConfederation("CONMEBOL")).toBe("South America");
    expect(regionForConfederation("UEFA")).toBe("Europe");
    expect(regionForConfederation("AFC")).toBe("Asia");
    expect(regionForConfederation("CAF")).toBe("Africa");
    expect(regionForConfederation("OFC")).toBe("Asia");
  });
});
