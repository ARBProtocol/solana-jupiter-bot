const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const { default: SelectInput } = require("ink-select-input");
const chalk = require("chalk");

const AGGREGATORS = [
	{ label: "Jupiter", value: "jupiter" },
	{ label: "Prism", value: "prism" },
	{ label: chalk.gray("coming soon..."), value: "null" },
];

const Indicator = ({ label, value }) => {
	const {
		config: {
			aggregator: { value: selectedValue },
		},
	} = useContext(WizardContext);

	const isSelected = value === selectedValue;

	return <Text>{chalk[isSelected ? "greenBright" : "white"](`${label}`)}</Text>;
};

function Aggregator() {
	const { configSetValue } = useContext(WizardContext);

	const handleTradingAggregatorSelect = (aggregator) => {
		configSetValue("aggregator", aggregator.value);
	};

	return (
		<Box flexDirection="column">
			<Text>Select Trading Aggregator:</Text>
			<Box margin={1}>
				<SelectInput
					items={AGGREGATORS}
					itemComponent={Indicator}
					onSelect={handleTradingAggregatorSelect}
				/>
			</Box>
		</Box>
	);
}
module.exports = Aggregator;
