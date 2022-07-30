const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");

const Confirm = () => {
	const {
		config: {
			strategy: { value: strategy },
			network: { value: network },
			tokens: { value: tokens },
			slippage: { value: slippage },
		},
	} = useContext(WizardContext);

	return (
		<Box flexDirection="column">
			<Text>Confirm your settings:</Text>
			<Box margin={1}>
				<Text>Strategy: {strategy}</Text>
				<Text>Network: {network}</Text>
				<Text>
					Tokens: {tokens.tokenA.symbol} / {tokens.tokenB.symbol}
				</Text>
				<Text>Slippage: {slippage}</Text>
			</Box>
		</Box>
	);
};

module.exports = Confirm;
