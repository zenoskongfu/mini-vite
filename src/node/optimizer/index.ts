import { build } from "esbuild";
import path from "path";
import { scanPlugin } from "./scanPlugin";
import picocolors from "picocolors";

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
}
