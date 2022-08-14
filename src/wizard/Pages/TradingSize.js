const React = require("react");
const { Box, Text } = require("ink");
const { useContext, useState } = require("react");
const WizardContext = require("../WizardContext");
const { default: TextInput } = require("ink-text-input");
const chalk = require("chalk");
const { default: SelectInput } = require("ink-select-input");

const TRADING_SIZE_STRATEGIES = [
	{ label: "cumulative", value: "cumulative" },
	{ label: "fixed", value: "fixed" },
];

const Indicator = ({ label, value }) => {
	const {
		config: {
			"trading size": { value: selectedValue },
		},
	} = useContext(WizardContext);

	const isSelected = value === selectedValue.strategy;

	return <Text>{chalk[isSelected ? "greenBright" : "white"](`${label}`)}</Text>;
};

function TradingSize() {
	const {
		config: {
			tokens: { value: tokensValue, isSet: tokensIsSet },
			"trading size": { value: tradingSizeValue, isSet: tradingSizeIsSet },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [tempTradingSizeValue, setTempTradingSizeValue] =
		useState(tradingSizeValue);

	const handleSubmit = (value) => {
		configSetValue("trading size", {
			value: value,
			isSet: true,
		});
	};

	return (
		<Box flexDirection="column">
			<Text color="gray">Set trading_size</Text>
			<Box flexDirection="row" marginTop={1}>
				<Text>
					trading size:{" "}
					{!tradingSizeIsSet ? (
						<Text color="yellowBright">
							<TextInput
								value={tempTradingSizeValue.toString() || ""}
								placeholder="0.0"
								onChange={(value) => {
									setTempTradingSizeValue(value);
								}}
								onSubmit={handleSubmit}
							/>
						</Text>
					) : (
						<Text color="greenBright">{tempTradingSizeValue}</Text>
					)}
					<Text color="gray"> {tokensValue.tokenA.symbol}</Text>
				</Text>
			</Box>
		</Box>
	);
}
module.exports = TradingSize;
