"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/node/cli.ts
var import_cac = __toESM(require("cac"));

// src/node/server/index.ts
var import_connect = __toESM(require("connect"));
var import_picocolors2 = __toESM(require("picocolors"));

// src/node/optimizer/index.ts
var import_esbuild = require("esbuild");
var import_path4 = __toESM(require("path"));

// src/node/constant.ts
var import_path = __toESM(require("path"));
var EXTERNAL_TYPES = ["css", "less", "sass", "scss", "vue", "png", "jpeg", "jpg", "gif", "svg", "ico"];
var BARE_IMPORT_RE = /^[\w@][^:]/;
var PRE_BUNDLE_DIR = import_path.default.join("node_modules", ".m-vite");

// src/node/optimizer/scanPlugin.ts
function scanPlugin(deps) {
  return {
    name: "esbuild: scan-plugin",
    setup(build2) {
      build2.onResolve(
        {
          filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})`)
        },
        (resolveInfo) => {
          return {
            path: resolveInfo.path,
            external: true
          };
        }
      );
      build2.onResolve({ filter: BARE_IMPORT_RE }, (resolveInfo) => {
        const { path: id } = resolveInfo;
        deps.add(id);
        return {
          path: id,
          external: true
        };
      });
    }
  };
}

// src/node/optimizer/index.ts
var import_picocolors = __toESM(require("picocolors"));

// src/node/optimizer/preBundlePlugin.ts
var import_resolve = __toESM(require("resolve"));
var import_es_module_lexer = require("es-module-lexer");

// src/node/utils.ts
var import_os = __toESM(require("os"));
var import_path2 = __toESM(require("path"));
function slash(p) {
  return p.replace(/\\/g, "/");
}
var isWindows = import_os.default.platform() === "win32";
function normallizePath(id) {
  return import_path2.default.posix.normalize(isWindows ? slash(id) : id);
}

// src/node/optimizer/preBundlePlugin.ts
var import_fs_extra = __toESM(require("fs-extra"));
var import_path3 = __toESM(require("path"));
function preBundlePlugin(deps) {
  return {
    name: 'esbuild"pre-bundle',
    setup(build2) {
      build2.onResolve({ filter: BARE_IMPORT_RE }, (resolveInfo) => {
        const { path: id, importer } = resolveInfo;
        const isEntry = !importer;
        console.log("preBundlePlugin id: ", id);
        if (deps.has(id)) {
          return isEntry ? {
            path: id,
            // 标记入口
            namespace: "dep"
          } : {
            // 如果不是入口，就可以获取绝对路径
            path: import_resolve.default.sync(id, { basedir: process.cwd() })
          };
        }
      });
      build2.onLoad({ filter: /.*/, namespace: "dep" }, async (loadInfo) => {
        await import_es_module_lexer.init;
        const id = loadInfo.path;
        const root = process.cwd();
        const entryPath = normallizePath(import_resolve.default.sync(id, { basedir: root }));
        const code = await import_fs_extra.default.readFile(entryPath, "utf-8");
        const [imports, exports] = await (0, import_es_module_lexer.parse)(code);
        let proxyModule = [];
        if (!imports.length && !exports.length) {
          const res = require(entryPath);
          const specifiers = Object.keys(res);
          proxyModule.push(
            `export { ${specifiers.join(",")} } from "${entryPath}"`,
            `export default require("${entryPath}")`,
            // lazy load
            "const zenos = 'just for test'"
          );
        } else {
          if (exports.includes("default")) {
            proxyModule.push(`import d from "${entryPath}"; export default d`);
          }
          proxyModule.push(`export * from "${entryPath}"`);
        }
        const loader = import_path3.default.extname(entryPath).slice(1);
        return {
          loader,
          contents: proxyModule.join("\n"),
          resolveDir: root
        };
      });
    }
  };
}

// src/node/optimizer/index.ts
async function optimize(root, entryPath) {
  const entry = import_path4.default.resolve(root, entryPath);
  const deps = /* @__PURE__ */ new Set();
  await (0, import_esbuild.build)({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)]
  });
  console.log(
    `${import_picocolors.default.green("\u9700\u8981\u9884\u6784\u5EFA\u7684\u4F9D\u8D56")}:
${[...deps].map(import_picocolors.default.green).map((item) => ` ${item}`).join("\n")}`
  );
  const meta = await (0, import_esbuild.build)({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    metafile: true,
    outdir: import_path4.default.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(deps)]
  });
}

// src/node/server/index.ts
async function startDevServer(entryPath) {
  const app = (0, import_connect.default)();
  const root = process.cwd();
  const startTime = Date.now();
  app.listen(3e3, async () => {
    await optimize(root, entryPath);
    console.log(import_picocolors2.default.green("\u{1F680} No-Bundle \u670D\u52A1\u5DF2\u7ECF\u6210\u529F\u542F\u52A8!"), `\u8017\u65F6: ${Date.now() - startTime}ms`);
    console.log(`> \u672C\u5730\u8BBF\u95EE\u8DEF\u5F84\uFF1A ${import_picocolors2.default.blue("http://localhost:3000")}`);
  });
}

// src/node/cli.ts
var cli = (0, import_cac.default)();
cli.command("[root]", "Run the development server").alias("serve").alias("dev").option("--entry, --entryPath <path>", "input entry path").action(async (command, options) => {
  await startDevServer(options.entry || "src/index.ts");
});
cli.help();
cli.parse();
//# sourceMappingURL=index.js.map