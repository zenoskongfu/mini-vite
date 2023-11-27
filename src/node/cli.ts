import cac from "cac";

const cli = cac();

// 可以在不输入命令的情况下，对options进行限制
// 可选的命令参数，可以被action捕获？
cli.command("[root]", "Run the development server")
	.alias("serve")
	.alias("dev")
	.action(async () => {
		console.log("测试 cli～");
	});

cli.help();

cli.parse();
