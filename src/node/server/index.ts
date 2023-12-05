import connect from "connect";
import picocolors from "picocolors";
import { optimize } from "../optimizer";
import { indexHtmlMiddware } from "./middlewares/indexHtml";
import { PluginContainer, createPluginContainer } from "../pluginContainer";
import { Plugin } from "../plugin";
import { resolvePlugins } from "../plugins";

export interface ServerContext {
	root: string;
	pluginContainer: PluginContainer;
	app: connect.Server;
	plugins: Plugin[];
}

export async function startDevServer(entryPath: string) {
	const app = connect();
	const root = process.cwd();
	const startTime = Date.now();

	const plugins = resolvePlugins();
	const pluginContainer = createPluginContainer(plugins);

	const serverContext: ServerContext = {
		root: process.cwd(),
		app,
		pluginContainer,
		plugins,
	};

	for (let plugin of plugins) {
		if (plugin.configureServer) {
			await plugin.configureServer(serverContext);
		}
	}

	app.use(indexHtmlMiddware(serverContext));
	app.listen(3000, async () => {
		await optimize(root, entryPath);
		console.log(picocolors.green("🚀 No-Bundle 服务已经成功启动!"), `耗时: ${Date.now() - startTime}ms`);

		console.log(`> 本地访问路径： ${picocolors.blue("http://localhost:3000")}`);
	});
}
