import * as FileStreamRotator from "file-stream-rotator";

// TODO !!!

const rotatingLogStream = FileStreamRotator.getStream({
	filename: "./temp/bot.log",
	size: "1k", // rotate every 1 MegaBytes written
	max_logs: "3", // keep 10 back copies
});
