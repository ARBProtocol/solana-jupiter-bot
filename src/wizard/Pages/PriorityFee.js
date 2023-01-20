const React = require("react");
const { Box, Text } = require("ink");
const { useContext, useState, useRef, useEffect } = require("react");
const WizardContext = require("../WizardContext");

const { default: TextInput } = require("ink-text-input");

function PriorityFee() {
	let isMountedRef = useRef(false);
	const {
		config: {
			"priority fee": { value: priorityFeeValue },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [priorityFee, setPriorityFee] = useState(priorityFeeValue.toString());
	const [inputBorderColor, setInputBorderColor] = useState("gray");

	const handlePriorityFeeSubmit = (value) => {
		configSetValue("priority fee", value);
	};

	const handlePriorityFeeChange = (value) => {
		if (!isMountedRef.current) return;

		const badChars = /[^0-9.]/g;
		badChars.test(value)
			? setInputBorderColor("red")
			: setInputBorderColor("gray");
		const sanitizedValue = value.replace(badChars, "");
		setPriorityFee(sanitizedValue);
		setTimeout(() => isMountedRef.current && setInputBorderColor("gray"), 100);
	};

	useEffect(() => {
		isMountedRef.current = true;
		return () => (isMountedRef.current = false);
	}, []);

	return (
		<Box flexDirection="column">
			<Text color="gray">
				Priority Fee is set in Lamports and can effect strategy efficiency.
			</Text>
			<Text color="gray">
				Please make sure you know what you are doing before changing these
				settings. 1 lamport is equal to 0.000005 SOL
			</Text>

			<Box flexDirection="row" alignItems="center">
				<Text>Priority Fee:</Text>
				<Box borderStyle="round" borderColor={inputBorderColor} marginLeft={1}>
					<TextInput
						value={priorityFee}
						onChange={handlePriorityFeeChange}
						onSubmit={handlePriorityFeeSubmit}
					/>
				</Box>
				<Text>lamports</Text>
			</Box>
		</Box>
	);
}
module.exports = PriorityFee;
