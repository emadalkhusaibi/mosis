import { describe, expect, it } from "vitest";
import { projection } from "./forecast";
import { toBaisa } from "@/lib/money";

const f = { price: toBaisa(5), variable: toBaisa(3), units: 400, fixed: toBaisa(600), setup: toBaisa(1000), growth: 0, capacity: 600 };

describe("projection", () => {
  it("matches the original domain checks, in baisa", () => {
    const r = projection(f, toBaisa(5000));
    expect(r.unitMargin).toBe(toBaisa(2));
    expect(r.breakEvenUnits).toBe(300);
    expect(r.months[0].profit).toBe(toBaisa(200));
    expect(r.months[11].cash).toBe(toBaisa(6400));
    expect(r.totalRevenue).toBe(toBaisa(24000));
  });
  it("applies scenarios and capacity", () => {
    expect(projection(f, toBaisa(5000), "low").months[0].units).toBe(280);
    expect(projection(f, toBaisa(5000), "high").months[0].units).toBe(520);
    expect(projection({ ...f, units: 1000 }, toBaisa(5000)).months[0].units).toBe(600);
    expect(projection({ ...f, capacity: 0, units: 1000 }, toBaisa(5000)).months[0].units).toBe(1000);
  });
  it("flags no break-even and negative cash", () => {
    expect(projection({ ...f, price: toBaisa(3) }, toBaisa(5000)).breakEvenUnits).toBeNull();
    expect(projection({ ...f, setup: toBaisa(6000) }, toBaisa(5000)).initialCash).toBe(toBaisa(-1000));
    expect(projection({ ...f, units: 0, setup: toBaisa(5000) }, toBaisa(5000)).firstNegativeMonth).toBe(1);
    expect(projection({ ...f, growth: -50 }, toBaisa(5000)).months[1].units).toBe(200);
  });
});
