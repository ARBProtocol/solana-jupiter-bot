const initialState = {
	nav: {
		currentStep: 0,
		steps: ["network", "rpc", "strategy", "tokens"],
	},
	config: {
		network: {
			value: "",
			isSet: false,
		},
		rpc: {
			value: [],
			isSet: false,
			state: {
				items: [
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
				],
			},
		},
	},
};

module.exports = initialState;
