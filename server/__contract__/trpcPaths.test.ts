/**
 * M0 CONTRACT FREEZE — tRPC procedure paths.
 *
 * The client calls procedures by path (e.g. `customer.xxx`). During the
 * Feature-Driven Architecture migration, routers are split across files, but
 * every path must stay identical. If this snapshot changes, a client-facing
 * API path was renamed/removed — treat as a breaking change.
 *
 * Update intentionally only: `npx vitest run -u server/__contract__`
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

describe("contract: tRPC procedure paths", () => {
  it("exposes the frozen set of procedure paths", () => {
    const procedures = (appRouter as any)._def.procedures as Record<string, any>;
    const paths = Object.keys(procedures)
      .map((p) => `${p} [${procedures[p]?._def?.type ?? "unknown"}]`)
      .sort();
    expect(paths.length).toBeGreaterThan(0);
    expect(paths).toMatchSnapshot();
  });
});
