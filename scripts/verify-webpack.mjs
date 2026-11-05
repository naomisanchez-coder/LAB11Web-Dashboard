import fs from "node:fs";
import { spawnSync } from "node:child_process";

// Alternativa de verificación para entornos que bloquean los sockets de Turbopack.
// No cambia el comando de producción ni conserva la adaptación en next.config.ts.
const file = new URL("../next.config.ts", import.meta.url);
const original = fs.readFileSync(file, "utf8");
const marker = "  /* config options here */";
if (!original.includes(marker) || /webpack\s*[:(]/.test(original)) {
  throw new Error(
    "La configuración cambió. Revisa la adaptación antes de ejecutar esta verificación.",
  );
}
const temporary = original.replace(
  marker,
  `  webpack(config) {
    config.module.rules.push({
      test: /globals\\.css$/,
      enforce: 'pre',
      use: ['@tailwindcss/turbopack'],
    });
    return config;
  },`,
);
try {
  fs.writeFileSync(file, temporary);
  const result = spawnSync(
    process.execPath,
    ["node_modules/next/dist/bin/next", "build", "--webpack"],
    {
      cwd: new URL("../", import.meta.url),
      stdio: "inherit",
      env: process.env,
    },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  fs.writeFileSync(file, original);
  console.log("next.config.ts restaurado sin cambios permanentes.");
}
