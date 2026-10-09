/**
 * scripts/check-architecture.ts
 *
 * Verifies Feature-Driven Architecture (FDA) boundaries:
 * 1. Client never imports server/ except `type AppRouter` in `client/src/lib/trpc.ts`.
 * 2. `shared/` never imports from `features/`.
 * 3. `features/` never imports from `pages/`.
 * 4. Files exceeding 800 lines generate warnings.
 */

import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
let errorsCount = 0;
let warningsCount = 0;

function walk(dir: string, fileCallback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist" && entry.name !== "build") {
        walk(fullPath, fileCallback);
      }
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      fileCallback(fullPath);
    }
  }
}

console.log("Checking architecture boundaries...\n");

// 1. Check client imports
walk(path.join(projectRoot, "client", "src"), (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, "/");

  // Rule: Client never imports server/ except AppRouter in client/src/lib/trpc.ts
  const serverImportMatch = content.match(/from\s+["'][^"']*server\/[^"']*["']/g);
  if (serverImportMatch) {
    if (relPath !== "client/src/lib/trpc.ts") {
      console.error(`[ERROR] Rule 1 violated: Client file ${relPath} imports server/ directly: ${serverImportMatch.join(", ")}`);
      errorsCount++;
    }
  }

  // Rule: features never imports pages
  if (relPath.includes("client/src/features/")) {
    const pagesImportMatch = content.match(/from\s+["'][^"']*pages\/[^"']*["']/g);
    if (pagesImportMatch) {
      console.error(`[ERROR] Rule 2 violated: Feature file ${relPath} imports pages/: ${pagesImportMatch.join(", ")}`);
      errorsCount++;
    }
  }

  // Rule: shared never imports features
  if (relPath.includes("client/src/shared/") || relPath.includes("shared/")) {
    const featuresImportMatch = content.match(/from\s+["'][^"']*features\/[^"']*["']/g);
    if (featuresImportMatch) {
      console.error(`[ERROR] Rule 3 violated: Shared file ${relPath} imports features/: ${featuresImportMatch.join(", ")}`);
      errorsCount++;
    }
  }

  // File size check: warn on files > 800 lines
  const lines = content.split("\n").length;
  if (lines > 800 && !relPath.includes("components/ui/") && !relPath.includes("drizzle/schema")) {
    console.warn(`[WARN] Large file: ${relPath} has ${lines} lines (>800 lines limit).`);
    warningsCount++;
  }
});

console.log(`\nArchitecture Check Completed: ${errorsCount} errors, ${warningsCount} warnings.`);
if (errorsCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
