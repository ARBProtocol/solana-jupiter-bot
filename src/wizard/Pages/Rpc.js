const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");

function Network() {
	const { nav } = useContext(WizardContext);
	return (
		<Box>
			<Text>RPC COMPONENT</Text>
		</Box>
	);
}
module.exports = Network;
