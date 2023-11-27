import connect from "connect";
import picocolors from "picocolors";
import { optimize } from "../optimizer";

export async function startDevServer(entryPath: string) {
	const app = connect();
	const root = process.cwd();

	const startTime = Date.now();

	app.listen(3000, async () => {
		await optimize(root, entryPath);
		console.log(picocolors.green("🚀 No-Bundle 服务已经成功启动!"), `耗时: ${Date.now() - startTime}ms`);

		console.log(`> 本地访问路径： ${picocolors.blue("http://localhost:3000")}`);
	});
}
