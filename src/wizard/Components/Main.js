const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const importJsx = require("import-jsx");
const Divider = require("ink-divider");
const Router = importJsx("./Router");

function Main() {
	const { nav } = useContext(WizardContext);
	return (
		<Box flexDirection="column">
			<Divider title={nav.steps[nav.currentStep]} />
			<Box borderStyle="round" borderColor={"greenBright"} marginY={1}></Box>
			<Router />
		</Box>
	);
}
module.exports = Main;
