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
			network: { value: network },
			rpc: { value: rpc },
			strategy: { value: strategy },
			tokens: { value: tokens },
			slippage: { value: slippage },
		},
		config,
	} = useContext(WizardContext);

	return (
		<Box flexDirection="column">
			<Text>Confirm your settings:</Text>
			<Box margin={1} flexDirection="column">
				<Text>Network: {chalk.greenBright(network)}</Text>
				<Text>RPC: {chalk.greenBright(rpc)}</Text>
				<Text>Strategy: {chalk.bold.greenBright(strategy)}</Text>
				<Text>
					Tokens: {chalk.bold.blueBright(tokens.tokenA.symbol)} /{" "}
					{chalk.bold.blueBright(tokens.tokenB.symbol)}
				</Text>
				<Text>Slippage: {chalk.bold.greenBright(slippage)}</Text>
			</Box>
			<TextInput
				value={`${chalk.bold.greenBright("[ CONFIRM ]")}`}
				showCursor={false}
				onSubmit={() => {
					createConfigFile(config);
				}}
			/>
		</Box>
	);
};

module.exports = Confirm;
