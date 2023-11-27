import connect from "connect";
import picocolors from "picocolors";

export async function startDevServer() {
	const app = connect();
	const root = process.cwd();

	const startTime = Date.now();

	app.listen(3000, async () => {
		console.log(picocolors.green("🚀 No-Bundle 服务已经成功启动!"), `耗时: ${Date.now() - startTime}ms`);

		console.log(`> 本地访问路径： ${picocolors.blue("http://localhost:3000")}`);
	});
}
