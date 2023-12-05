import os from "os";
import path from "path";
export function slash(p: string) {
	return p.replace(/\\/g, "/"); //将斜杠变成反斜杠
}

export const isWindows = os.platform() === "win32";

export function normallizePath(id: string): string {
	// 将路径规范化，两点，双斜杠会变成单斜杠等等
	return path.posix.normalize(isWindows ? slash(id) : id);
}
