import { describe, expect, it } from "vitest";
import { emptyState, type State } from "./state";
import { needOf, nextStep, pathFor } from "./path";
import { sectorOf } from "@/content/sectors";
import { toBaisa } from "@/lib/money";

function venture(sector: string, patch: Partial<State["venture"]> = {}): State {
  const s = emptyState();
  const pack = sectorOf(sector);
  return {
    ...s,
    venture: { ...s.venture, sector, started: true, ...patch },
    finance: { ...s.finance, price: toBaisa(pack.price), variable: toBaisa(pack.variable), units: pack.units, fixed: toBaisa(pack.fixed) },
  };
}

describe("founder path", () => {
  it("infers a need from the stage when none was chosen", () => {
    expect(needOf(venture("cafe", { stage: "validating" }))).toBe("demand");
    expect(needOf(venture("cafe", { stage: "ready" }))).toBe("launch");
    expect(needOf(venture("cafe", { stage: "ready", need: "people" }))).toBe("people");
  });

  it("orders the steps by what the founder needs", () => {
    expect(pathFor(venture("cafe", { need: "demand" })).map((x) => x.id)).toEqual(["idea", "test", "numbers", "mentor"]);
    expect(pathFor(venture("cafe", { need: "launch" })).map((x) => x.id)).toEqual(["numbers", "launch", "reserve", "record"]);
    expect(nextStep(venture("cafe", { need: "money" }))?.id).toBe("numbers");
  });

  it("words the steps for the business type", () => {
    const cafe = pathFor(venture("cafe", { need: "demand" }));
    const gym = pathFor(venture("fitness", { need: "demand" }));
    expect(cafe.find((x) => x.id === "test")!.title).toEqual(sectorOf("cafe").test);
    expect(gym.find((x) => x.id === "test")!.title).toEqual(sectorOf("fitness").test);
    expect(cafe.find((x) => x.id === "numbers")!.title[0]).toContain("per order");
    expect(gym.find((x) => x.id === "numbers")!.title[0]).toContain("per membership");
  });

  it("uses the founder's own words for an unlisted business", () => {
    const s = venture("other", { other: "Bee keeping", need: "plan" });
    expect(pathFor(s)[0].sub[0]).toContain("bee keeping");
  });

  it("ticks steps off from real work", () => {
    let s = venture("cafe", { need: "money" });
    expect(pathFor(s)[0].done).toBe(false);
    s = { ...s, finance: { ...s.finance, price: s.finance.price + 500 } };
    expect(pathFor(s)[0].done).toBe(true);
    s = { ...s, reserve: s.finance.fixed * 2 };
    expect(pathFor(s)[1].done).toBe(true);
    expect(nextStep(s)?.id).toBe("practice");
  });
});
