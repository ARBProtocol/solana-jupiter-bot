const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const { default: TextInput } = require("ink-text-input");
const chalk = require("chalk");
const { createConfigFile } = require("../../utils");

const Confirm = () => {
	const {
		config: {
			strategy: { value: strategy },
			network: { value: network },
			tokens: { value: tokens },
			slippage: { value: slippage },
		},
		config,
	} = useContext(WizardContext);

	return (
		<Box flexDirection="column">
			<Text>Confirm your settings:</Text>
			<Box margin={1} flexDirection="column">
				<Text>Strategy: {strategy}</Text>
				<Text>Network: {network}</Text>
				<Text>
					Tokens: {tokens.tokenA.symbol} / {tokens.tokenB.symbol}
				</Text>
				<Text>Slippage: {slippage}</Text>
			</Box>
			<TextInput
				value={`${chalk.bold.greenBright("[ CONFIRM ]")}`}
				showCursor={false}
				onSubmit={() => {
					console.log("LFG!");
					createConfigFile(config);
				}}
			/>
		</Box>
	);
};

module.exports = Confirm;
