const React = require("react");
const { Box, Text, useInput } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext, useState, useEffect } = require("react");
const { default: SelectInput } = require("ink-select-input");
const chalk = require("chalk");

// const items = [
// 	{
// 		label: "First",
// 		value: {
// 			slug: "first",
// 			isSelected: false,
// 		},
// 	},
// 	{
// 		label: "Second",
// 		value: {
// 			slug: "second",
// 			isSelected: false,
// 		},
// 	},
// 	{
// 		label: "Third",
// 		value: {
// 			slug: "third",
// 			isSelected: true,
// 		},
// 	},
// ];
const items = [
	{
		label: "First",
		value: "first",
		isSelected: false,
	},
	{
		label: "Second",
		value: "second",
		isSelected: false,
	},
	{
		label: "Third",
		value: "third",
		isSelected: false,
	},
];

const Indicator = ({ label: selectedLabel, value: selectedValue }) => {
	const {
		config: {
			rpc: {
				value,
				state: { items },
			},
		},
	} = useContext(WizardContext);

	const isSelected = items.find(
		(item) => item.value === selectedValue
	).isSelected;

	return (
		<Text>
			{chalk[value?.includes(selectedValue) ? "greenBright" : "white"](
				`${isSelected ? "⦿" : "○"} ${selectedLabel}`
			)}
		</Text>
	);
};

function Rpc() {
	const {
		config: {
			rpc: { state },
		},
		configSetValue,
		configSwitchState,
	} = useContext(WizardContext);

	const items = state?.items || [];

	const handleSubmit = () => {
		const valueToSet = items
			.filter((item) => item.isSelected)
			.map((item) => item.value);
		configSetValue("rpc", valueToSet);
	};

	const [highlightedItem, setHighlightedItem] = useState();

	useInput((input) => {
		if (input === " " && highlightedItem) {
			configSwitchState("rpc", highlightedItem.value);
		}
	});

	const onHighlight = (item) => setHighlightedItem(item);
	return (
		<Box flexDirection="column">
			<Text>RPC COMPONENT</Text>
			<SelectInput
				items={items}
				onHighlight={onHighlight}
				onSelect={handleSubmit}
				itemComponent={Indicator}
			/>
		</Box>
	);
}
module.exports = Rpc;
