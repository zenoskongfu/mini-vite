import { pathExists, readFile } from "fs-extra";
import path from "path";
import { ServerContext } from "..";
import { NextHandleFunction } from "connect";

export function indexHtmlMiddware(serverContext: ServerContext): NextHandleFunction {
	return async (req, res, next) => {
		if (req.url == "/") {
			const { root } = serverContext;

			const htmlPath = path.join(root, "index.html");
			if (await pathExists(htmlPath)) {
				const htmlContent = await readFile(htmlPath, "utf-8");
				let html = htmlContent;
				for (let plugin of serverContext.plugins) {
					if (plugin.transformIndexHtml) {
						html = await plugin.transformIndexHtml(html);
					}
				}
				res.statusCode = 200;
				res.setHeader("Content-Type", "text/html");
				return res.end(html);
			}
		}
		next();
	};
}
