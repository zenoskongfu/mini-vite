import { Plugin } from "esbuild";
import { BARE_IMPORT_RE, EXTERNAL_TYPES } from "../constant";

export function scanPlugin(deps: Set<string>): Plugin {
	return {
		name: "esbuild: scan-plugin",
		setup(build) {
			// 忽略构建的文件类型
			build.onResolve(
				{
					filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})`),
				},
				(resolveInfo) => {
					return {
						path: resolveInfo.path,
						external: true,
					};
				}
			);

			// 记录依赖
			build.onResolve({ filter: BARE_IMPORT_RE }, (resolveInfo) => {
				const { path: id } = resolveInfo;
				deps.add(id);
				return {
					path: id,
					external: true,
				};
			});
		},
	};
}
