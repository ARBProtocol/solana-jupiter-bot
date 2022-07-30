const React = require("react");
const { Box, Text } = require("ink");
const { default: SelectInput } = require("ink-select-input");
const chalk = require("chalk");
const { useContext, useState } = require("react");
const WizardContext = require("../WizardContext");

const { default: TextInput } = require("ink-text-input");

const SLIPPAGE_STRATEGIES = [
	{ label: "Profit Or Kill 🗡", value: "profitOrKill" },
	{ label: "1%", value: 1 },
	{ label: "Custom", value: "custom" },
];

function Slippage() {
	const {
		config: {
			slippage: { value: slippage, isSet: slippageIsSet },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [tempSlippageStrategy, setTempSlippageStrategy] = useState(
		SLIPPAGE_STRATEGIES[0]
	);
	const [customSlippage, setCustomSlippage] = useState("1");
	const [inputBorderColor, setInputBorderColor] = useState("gray");

	const handleSlippageStrattegySelect = (slippage) => {
		const value = slippage.value;
		setTempSlippageStrategy(value);
		if (value !== "custom")
			configSetValue(
				"slippage",
				value === "profitOrKill" ? value : parseInt(value)
			);
	};

	const handleCustomSlippageChange = (value) => {
		const badChars = /[^0-9]/g;
		badChars.test(value)
			? setInputBorderColor("red")
			: setInputBorderColor("gray");
		const sanitizedValue = value.replace(badChars, "");
		setCustomSlippage(sanitizedValue);
		setTimeout(() => setInputBorderColor("gray"), 100);
	};

	const handleCustomSlippageSubmit = () => {
		configSetValue("slippage", parseInt(customSlippage));
	};

	return (
		<Box flexDirection="column">
			<Text>
				Set <Text color="#cdadff">slippage</Text> strategy
			</Text>
			<Box margin={1}>
				<SelectInput
					items={SLIPPAGE_STRATEGIES}
					onSelect={handleSlippageStrattegySelect}
				/>
			</Box>
			{tempSlippageStrategy === "custom" && (
				<Box flexDirection="row" alignItems="center">
					<Text>Custom slippage:</Text>
					<Box
						borderStyle="round"
						borderColor={inputBorderColor}
						marginLeft={1}
					>
						<TextInput
							value={customSlippage}
							onChange={handleCustomSlippageChange}
							onSubmit={handleCustomSlippageSubmit}
						/>
					</Box>
					<Text>%</Text>
				</Box>
			)}
		</Box>
	);
}
module.exports = Slippage;
