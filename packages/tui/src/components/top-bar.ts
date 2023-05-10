import { UIScreen } from "../ui-store";

export const TopBar = ({ currentScreen }: { currentScreen: UIScreen }) => {
	return `${currentScreen} < [W]allet  [M]ain | [ctrl+E]xecute  [ctrl+S]olscan  [ctrl+c] Exit`;
};
