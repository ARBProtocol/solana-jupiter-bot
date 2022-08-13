const React = require("react");
const { Box, Text, useApp } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const { default: TextInput } = require("ink-text-input");
const chalk = require("chalk");
const { createConfigFile } = require("../../utils");

const Confirm = () => {
	const { exit } = useApp();
	const {
		config: {
			network: { value: network },
			rpc: { value: rpc },
			strategy: { value: strategy },
			tokens: { value: tokens },
			slippage: { value: slippage },
			advanced: { value: advanced },
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
				<Text color="gray"></Text>
				<Text>
					Min Interval: {chalk.bold.greenBright(advanced.minInterval)}
				</Text>
			</Box>
			<TextInput
				value={`${chalk.bold.greenBright("[ CONFIRM ]")}`}
				showCursor={false}
				onSubmit={async () => {
					createConfigFile(config);
					exit();
				}}
			/>
		</Box>
	);
};

module.exports = Confirm;
