import { UIScreen } from "../ui-store";

export const TopBar = ({ currentScreen }: { currentScreen: UIScreen }) => {
	const paddedScreen = currentScreen.padEnd(12, " ");
	return `${paddedScreen} < [W]allet  [M]ain  [I]ncognito | [ctrl+E]xecute  [ctrl+S]olscan  [ctrl+c] Exit`;
};
