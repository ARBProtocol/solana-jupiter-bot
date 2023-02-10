const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const { default: SelectInput } = require("ink-select-input");
const chalk = require("chalk");
const CONSTANTS = require("../../constants");

const Indicator = ({ label, value }) => {
	const {
		config: {
			strategy: { value: selectedValue },
		},
	} = useContext(WizardContext);

	const isSelected = value === selectedValue;

	return <Text>{chalk[isSelected ? "greenBright" : "white"](`${label}`)}</Text>;
};

function Strategy() {
	const { configSetValue } = useContext(WizardContext);

	const handleTradingStrategySelect = (strategy) => {
		configSetValue("strategy", strategy.value);
	};

	return (
		<Box flexDirection="column">
			<Text>Select Trading Strategy:</Text>
			<Box margin={1}>
				<SelectInput
					items={CONSTANTS.TRADING_STRATEGIES}
					itemComponent={Indicator}
					onSelect={handleTradingStrategySelect}
				/>
			</Box>
		</Box>
	);
}
module.exports = Strategy;
