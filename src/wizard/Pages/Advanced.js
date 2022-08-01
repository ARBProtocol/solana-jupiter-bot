const React = require("react");
const { Box, Text } = require("ink");
const { useContext, useState } = require("react");
const WizardContext = require("../WizardContext");
const { default: TextInput } = require("ink-text-input");

function Advanced() {
	const {
		config: {
			advanced: { value: advancedValue, isSet: advancedIsSet },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [tempAdvancedValue, setTempAdvancedValue] = useState(advancedValue);

	const handleSubmit = (key, value) => {
		configSetValue("advanced", {
			value: {
				...advancedValue,
				[key]: value,
			},
		});
	};

	return (
		<Box flexDirection="column">
			<Text color="gray">
				Advanced settings can be crucial for strategy efficiency.
			</Text>
			<Text color="gray">
				Please make sure you know what you are doing before changing these
				settings.
			</Text>
			<Box flexDirection="row" marginTop={1}>
				<Text>
					Min Interval:{" "}
					{!advancedIsSet.minInterval ? (
						<Text color="yellowBright">
							<TextInput
								value={
									tempAdvancedValue?.minInterval
										? tempAdvancedValue.minInterval.toString()
										: ""
								}
								onChange={(value) => {
									setTempAdvancedValue({
										...tempAdvancedValue,
										minInterval: value,
									});
								}}
								onSubmit={(value) => {
									handleSubmit("minInterval", value);
								}}
							/>
						</Text>
					) : (
						<Text color="greenBright">{tempAdvancedValue?.minInterval}</Text>
					)}
				</Text>
			</Box>
		</Box>
	);
}
module.exports = Advanced;
