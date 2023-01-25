const React = require("react");
const { Box, Text } = require("ink");
const { useContext, useState, useRef, useEffect } = require("react");
const WizardContext = require("../WizardContext");

const { default: TextInput } = require("ink-text-input");

function BuyBack() {
	let isMountedRef = useRef(false);
	const {
		config: {
			"buy back": { value: buyBackValue },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [buyBack, setBuyBack] = useState(buyBackValue.toString());
	const [inputBorderColor, setInputBorderColor] = useState("gray");

	const handleBuyBackSubmit = (value) => {
		configSetValue("buy back", value);
	};

	const handleBuyBackChange = (value) => {
		if (!isMountedRef.current) return;

		const badChars = /[^0-9.]/g;
		badChars.test(value)
			? setInputBorderColor("red")
			: setInputBorderColor("gray");
		const sanitizedValue = value.replace(badChars, "");
		setBuyBack(sanitizedValue);
		setTimeout(() => isMountedRef.current && setInputBorderColor("gray"), 100);
	};

	useEffect(() => {
		isMountedRef.current = true;
		return () => (isMountedRef.current = false);
	}, []);

	return (
		<Box flexDirection="column">
			<Text color="gray">
				When set above 0, the amount specified will take X% of profit from last trade to buy ARB.
			</Text>
			<Text color="gray">
				Support ARB Token
			</Text>
			
			<Box flexDirection="row" alignItems="center">
				<Text>Buy Back:</Text>
				
				<Box borderStyle="round" borderColor={inputBorderColor} marginLeft={1}>
					<TextInput
						value={buyBack}
						onChange={handleBuyBackChange}
						onSubmit={handleBuyBackSubmit}
					/>
				</Box>
				<Text>%</Text>
			</Box>
		</Box>
	);
}
module.exports = BuyBack;
