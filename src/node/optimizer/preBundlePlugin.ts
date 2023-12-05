import { Loader, Plugin } from "esbuild";
import { BARE_IMPORT_RE } from "../constant";
import resolve from "resolve";
import { init, parse } from "es-module-lexer";
import { normallizePath as normalizePath } from "../utils";
import fs from "fs-extra";
import path from "path";

export function preBundlePlugin(deps: Set<string>): Plugin {
	return {
		name: 'esbuild"pre-bundle',
		setup(build) {
			build.onResolve({ filter: BARE_IMPORT_RE }, (resolveInfo) => {
				const { path: id, importer } = resolveInfo;
				const isEntry = !importer; //是入口文件

				console.log("preBundlePlugin id: ", id);
				if (deps.has(id)) {
					return isEntry
						? {
								path: id,
								// 标记入口
								namespace: "dep",
						  }
						: {
								// 如果不是入口，就可以获取绝对路径
								path: resolve.sync(id, { basedir: process.cwd() }),
						  };
				}
			});

			// load的作用似乎是将整个react库，用esm的方式加载进.m-vite
			// 相当于使用虚拟模块，将react库加载进.m-vite
			//load bare import
			build.onLoad({ filter: /.*/, namespace: "dep" }, async (loadInfo) => {
				await init;
				const id = loadInfo.path;
				const root = process.cwd();
				// 获取绝对路径,通过报名获得绝对路径
				const entryPath = normalizePath(resolve.sync(id, { basedir: root }));
				const code = await fs.readFile(entryPath, "utf-8");
				const [imports, exports] = await parse(code);
				let proxyModule = [];
				if (!imports.length && !exports.length) {
					// commonjs module
					// commonjs转esm的原因是，浏览器只能认识esm
					const res = require(entryPath);
					const specifiers = Object.keys(res); // 获得exports所有的key
					proxyModule.push(
						`export { ${specifiers.join(",")} } from "${entryPath}"`,
						`export default require("${entryPath}")`, // lazy load
						"const zenos = 'just for test'"
					);
				} else {
					// esm module
					if (exports.includes("default" as any)) {
						proxyModule.push(`import d from "${entryPath}"; export default d`);
					}
					proxyModule.push(`export * from "${entryPath}"`);
				}

				const loader = path.extname(entryPath).slice(1);
				return {
					loader: loader as Loader,
					contents: proxyModule.join("\n"),
					resolveDir: root,
				};
			});
		},
	};
}
