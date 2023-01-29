import { UIScreen } from "../ui-store";

export const TopBar = ({ currentScreen }: { currentScreen: UIScreen }) => {
	return `${currentScreen} < [C]onfig  [W]allet  [M]ain  [L]ogs | [ctrl+E]xecute  [ctrl+S]olscan  [ctrl+c] Exit`;
};
