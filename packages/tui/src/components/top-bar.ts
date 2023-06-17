import { UIScreen } from "../ui-store";

export const TopBar = ({ currentScreen }: { currentScreen: UIScreen }) => {
	const paddedScreen = currentScreen.padEnd(12, " ");
	return `${paddedScreen} < [w]allet  [m]ain  [i]ncognito [t]oggle charts | [ctrl+e]xecute  [ctrl+s]olscan  [ctrl+c] Exit`;
};
