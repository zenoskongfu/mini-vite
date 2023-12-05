var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/node/cli.ts
import cac from "cac";

// src/node/server/index.ts
import connect from "connect";
import picocolors2 from "picocolors";

// src/node/optimizer/index.ts
import { build } from "esbuild";
import path4 from "path";

// src/node/constant.ts
import path from "path";
var EXTERNAL_TYPES = ["css", "less", "sass", "scss", "vue", "png", "jpeg", "jpg", "gif", "svg", "ico"];
var BARE_IMPORT_RE = /^[\w@][^:]/;
var PRE_BUNDLE_DIR = path.join("node_modules", ".m-vite");

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
import picocolors from "picocolors";

// src/node/optimizer/preBundlePlugin.ts
import resolve from "resolve";
import { init, parse } from "es-module-lexer";

// src/node/utils.ts
import os from "os";
import path2 from "path";
function slash(p) {
  return p.replace(/\\/g, "/");
}
var isWindows = os.platform() === "win32";
function normallizePath(id) {
  return path2.posix.normalize(isWindows ? slash(id) : id);
}

// src/node/optimizer/preBundlePlugin.ts
import fs from "fs-extra";
import path3 from "path";
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
            path: resolve.sync(id, { basedir: process.cwd() })
          };
        }
      });
      build2.onLoad({ filter: /.*/, namespace: "dep" }, async (loadInfo) => {
        await init;
        const id = loadInfo.path;
        const root = process.cwd();
        const entryPath = normallizePath(resolve.sync(id, { basedir: root }));
        const code = await fs.readFile(entryPath, "utf-8");
        const [imports, exports] = await parse(code);
        let proxyModule = [];
        if (!imports.length && !exports.length) {
          const res = __require(entryPath);
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
        const loader = path3.extname(entryPath).slice(1);
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
  const entry = path4.resolve(root, entryPath);
  const deps = /* @__PURE__ */ new Set();
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)]
  });
  console.log(
    `${picocolors.green("\u9700\u8981\u9884\u6784\u5EFA\u7684\u4F9D\u8D56")}:
${[...deps].map(picocolors.green).map((item) => ` ${item}`).join("\n")}`
  );
  const meta = await build({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    metafile: true,
    outdir: path4.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(deps)]
  });
}

// src/node/server/index.ts
async function startDevServer(entryPath) {
  const app = connect();
  const root = process.cwd();
  const startTime = Date.now();
  app.listen(3e3, async () => {
    await optimize(root, entryPath);
    console.log(picocolors2.green("\u{1F680} No-Bundle \u670D\u52A1\u5DF2\u7ECF\u6210\u529F\u542F\u52A8!"), `\u8017\u65F6: ${Date.now() - startTime}ms`);
    console.log(`> \u672C\u5730\u8BBF\u95EE\u8DEF\u5F84\uFF1A ${picocolors2.blue("http://localhost:3000")}`);
  });
}

// src/node/cli.ts
var cli = cac();
cli.command("[root]", "Run the development server").alias("serve").alias("dev").option("--entry, --entryPath <path>", "input entry path").action(async (command, options) => {
  await startDevServer(options.entry || "src/index.ts");
});
cli.help();
cli.parse();
//# sourceMappingURL=index.mjs.map