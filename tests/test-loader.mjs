import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
const nodeRequire = createRequire(import.meta.url);

// Ejecuta el TypeScript real del proyecto sin instalar un framework de pruebas.
export function createLoader({
  overrides = {},
  transform = (_id, exports) => exports,
} = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const loaded = { exports: {} };
    cache.set(file, loaded.exports);
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    function localRequire(id) {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      if (id.startsWith(".") || id.startsWith("@/")) {
        const base = id.startsWith("@/")
          ? path.resolve("src", id.slice(2))
          : path.resolve(path.dirname(file), id);
        const target = [base, base + ".ts", base + ".tsx"].find(
          (f) => fs.existsSync(f) && fs.statSync(f).isFile(),
        );
        if (!target) throw Error(`Import no encontrado: ${id}`);
        return transform(id, load(target));
      }
      return nodeRequire(id);
    }
    vm.runInNewContext(
      source,
      {
        module: loaded,
        exports: loaded.exports,
        require: localRequire,
        structuredClone,
        Date,
        Set,
        crypto: globalThis.crypto,
        setTimeout,
        clearTimeout,
      },
      { filename: file },
    );
    cache.set(file, loaded.exports);
    return loaded.exports;
  }
  return load;
}
