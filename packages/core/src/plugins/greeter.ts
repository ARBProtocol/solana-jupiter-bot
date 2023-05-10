// import { LoggerPlugin } from "./with-logger";

// export const withGreeter = <B extends LoggerPlugin>(bot: B) => ({
// 	...bot,
// 	greeter: (name: string) => {
// 		bot.logger.info("hello " + name);
// 	},
// });
export const withGreeter = <B>(bot: B) => ({
	...bot,
	greeter: () => {
		console.log("LoggerPlugin");
	},
});

// export const withGreeterTwo = <B extends LoggerPlugin>(bot: B) => ({
// 	...bot,
// 	greeterTwo: (fn: (bot: B) => void) => {
// 		fn(bot);
// 	},
// });
