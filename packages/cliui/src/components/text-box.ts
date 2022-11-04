import boxen from "boxen";

export const TextBox = () => {
	const textBox = boxen("Hello World!", {
		title: "Title",
		titleAlignment: "left",
		padding: 1,
	});

	return textBox;
};
