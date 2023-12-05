import type {
	LoadResult,
	PartialResolvedId,
	SourceDescription,
	PluginContext as RollupPluginContext,
	ResolvedId,
} from "rollup";
import { Plugin } from "./plugin";

export interface PluginContainer {
	resolveId(id: string, importer?: string): Promise<PartialResolvedId | null>;
	load(id: string): Promise<LoadResult | null>;
	transform(code: string, id: string): Promise<SourceDescription | null>;
}

export const createPluginContainer = (plugins: Plugin[]): PluginContainer => {
	// @ts-ignore
	class Context implements RollupPluginContext {
		async resolve(id: string, importer?: string) {
			let out = await pluginContainer.resolveId(id, importer);
			if (typeof out == "string") out = { id: out };
			return out as ResolvedId | null;
		}
	}

	const pluginContainer: PluginContainer = {
		async resolveId(id, importer) {
			const context = new Context() as any;
			for (const plugin of plugins) {
				if (plugin.resolveId) {
					const newId = await plugin.resolveId.call(context as any, id, importer);
					if (newId) {
						id = typeof newId === "string" ? newId : newId.id;
						return { id };
					}
				}
			}
			return null;
		},

		async load(id) {
			const context = new Context() as any;
			for (const plugin of plugins) {
				if (plugin.load) {
					const result = await plugin.load.call(context, id);
					if (result) {
						return result;
					}
				}
			}
			return null;
		},

		async transform(code, id) {
			const context = new Context() as any;
			for (let plugin of plugins) {
				if (plugin.transform) {
					const result = await plugin.transform.call(context, code, id);
					if (!result) continue;
					if (typeof result == "string") {
						code = result;
					} else if (result.code) {
						code = result.code;
					}
				}
			}
			return { code };
		},
	};

	return pluginContainer;
};
