/**
 * M0 CONTRACT FREEZE — /api/admin REST routes.
 *
 * Consumed by the external standalone admin console (see `dev:admin` script).
 * Method + path of every route must remain identical through the migration.
 *
 * Update intentionally only: `npx vitest run -u server/__contract__`
 */
import { describe, it, expect } from "vitest";
import { adminRouter } from "../adminApi";

describe("contract: /api/admin REST routes", () => {
  it("exposes the frozen set of admin REST routes", () => {
    const routes: string[] = [];
    for (const layer of (adminRouter as any).stack as any[]) {
      if (!layer.route) continue;
      const methods = Object.keys(layer.route.methods)
        .filter((m) => layer.route.methods[m])
        .map((m) => m.toUpperCase())
        .sort()
        .join(",");
      routes.push(`${methods} ${layer.route.path}`);
    }
    routes.sort();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes).toMatchSnapshot();
  });
});
