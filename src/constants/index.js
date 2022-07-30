const CONFIG_INITIAL_STATE = {
	nav: {
		currentStep: 0,
		steps: ["network", "rpc", "strategy", "tokens", "slippage"],
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
						label: process.env.DEFAULT_RPC,
						value: process.env.DEFAULT_RPC,
						isSelected: true,
					},
					...String(process.env.ALT_RPC_LIST)
						.split(",")
						.map((item) => ({
							label: item,
							value: item,
							isSelected: false,
						})),
				],
			},
		},
		strategy: {
			value: "",
			isSet: false,
		},
		tokens: {
			value: {
				tokenA: { symbol: "", address: "" },
				tokenB: { symbol: "", address: "" },
			},
			isSet: {
				tokenA: false,
				tokenB: false,
			},
		},
		slippage: {
			value: "ProfitOrKill",
			isSet: false,
		},
	},
};

module.exports = {
	DISCORD_INVITE_URL: "https://discord.gg/wcxYzfKNaE",
	CONFIG_INITIAL_STATE,
};
