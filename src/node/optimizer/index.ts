import { build } from "esbuild";
import path from "path";
import { scanPlugin } from "./scanPlugin";
import picocolors from "picocolors";
import { preBundlePlugin } from "./preBundlePlugin";
import { PRE_BUNDLE_DIR } from "../constant";

// bing apply call
export async function optimize(root: string, entryPath: string) {
	const entry = path.resolve(root, entryPath);
	const deps = new Set<string>();

	await build({
		entryPoints: [entry],
		bundle: true,
		write: false,
		plugins: [scanPlugin(deps)],
	});

	console.log(
		`${picocolors.green("需要预构建的依赖")}:\n${[...deps]
			.map(picocolors.green)
			.map((item) => ` ${item}`)
			.join("\n")}`
	);

	// 将构建产物放到指定目录，目的是将构建产物变成esm可以读取的模式
	const meta = await build({
		entryPoints: [...deps],
		write: true,
		bundle: true,
		format: "esm",
		splitting: true,
		metafile: true,
		outdir: path.resolve(root, PRE_BUNDLE_DIR),
		plugins: [preBundlePlugin(deps)],
	});

	// console.log(meta);
}
