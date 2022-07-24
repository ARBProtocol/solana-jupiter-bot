const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const { default: SelectInput } = require("ink-select-input");

const NETWORKS = [
	{ label: "mainnet-beta", value: "mainnet-beta" },
	{ label: "testnet", value: "testnet" },
	{ label: "devnet", value: "devnet" },
];

function Network() {
	const { config, configSetValue } = useContext(WizardContext);
	return (
		<Box flexDirection="column">
			<Text>
				Select Solana <Text color="magenta">Network</Text>:
			</Text>
			<Box margin={1}>
				<SelectInput
					items={NETWORKS}
					onSelect={(item) => configSetValue("network", item.value)}
				/>
			</Box>
		</Box>
	);
}
module.exports = Network;
