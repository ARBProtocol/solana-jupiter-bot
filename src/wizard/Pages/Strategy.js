const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const { default: SelectInput } = require("ink-select-input");
const chalk = require("chalk");

const TRADING_STRATEGIES = [
	{ label: "Ping Pong", value: "pingpong" },
	{ label: "Arbitrage", value: "arbitrage" },
	{ label: chalk.gray("coming soon..."), value: "null" },
];

function Strategy() {
	const { configSetValue } = useContext(WizardContext);
	return (
		<Box flexDirection="column">
			<Text>Select Trading Strategy:</Text>
			<Box margin={1}>
				<SelectInput
					items={TRADING_STRATEGIES}
					onSelect={(item) => configSetValue("strategy", item.value)}
				/>
			</Box>
		</Box>
	);
}
module.exports = Strategy;
