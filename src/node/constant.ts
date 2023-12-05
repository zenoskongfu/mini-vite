import path from "path";
export const EXTERNAL_TYPES = ["css", "less", "sass", "scss", "vue", "png", "jpeg", "jpg", "gif", "svg", "ico"];

export const BARE_IMPORT_RE = /^[\w@][^:]/; //第二个不是冒号，排除C:这种类型的路径

export const PRE_BUNDLE_DIR = path.join("node_modules", ".m-vite"); // 默认放在node_modules下面的.m-vite中
