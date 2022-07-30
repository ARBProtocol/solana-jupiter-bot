const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext, useState, useEffect } = require("react");
const { default: SelectInput } = require("ink-select-input");
const chalk = require("chalk");
const { default: axios } = require("axios");
const { TOKEN_LIST_URL } = require("@jup-ag/core");
const { default: TextInput } = require("ink-text-input");

const TRADING_STRATEGIES = [
	{ label: "Ping Pong", value: "pingpong" },
	{ label: "Arbitrage", value: "arbitrage" },
	{ label: chalk.gray("coming soon..."), value: "null" },
];

// TODO
function Tokens() {
	const {
		config: {
			strategy: { value: strategy },
			network: { value: network },
			tokens: { value: tokensValue, isSet: tokensIsSet },
		},
		configSetValue,
	} = useContext(WizardContext);
	const [tokens, setTokens] = useState([]);
	const [tempTokenA, setTempTokenA] = useState();
	const [tempTokenB, setTempTokenB] = useState();

	const handleSubmit = (tokenId, selectedToken) => {
		// go to the next step only if all tokens are set
		const goToNextStep =
			strategy === "pingpong" && tokenId === "tokenA" ? false : true;

		tokensIsSet[tokenId] = true;
		tokensValue[tokenId] = {
			symbol: selectedToken.label,
			address: selectedToken.value,
		};
		configSetValue(
			"tokens",
			{
			value: tokensValue,
			isSet: tokensIsSet,
			},
			goToNextStep
		);
	};

	useEffect(() => {
		// check if tokens.json exist
		if (fs.existsSync("./tokens.json")) {
			const tokensFromFile = JSON.parse(fs.readFileSync("./config.json"));
			tokens.tokensFromFile?.length > 0 && setTokens(tokensFromFile);
		} else {
			axios.get(TOKEN_LIST_URL[network]).then((res) => {
				setTokens(res.data);
				// save tokens to tokens.json file
				fs.writeFileSync(
					"./temp/tokens.json",
					JSON.stringify(res.data, null, 2)
				);
			});
		}
	}, []);

	return (
		<Box flexDirection="column">
			<Text>
				Set tokens for Your strategy. There is{" "}
				{tokens
					? chalk.magenta(tokens.length)
					: chalk.yellowBright("loading...")}{" "}
				tokens available
			</Text>
			<Box margin={1} flexDirection="column">
				<Text>
					Token A:{" "}
					{!tokensIsSet.tokenA ? (
						<>
							<TextInput
								value={
									tempTokenA ? tempTokenA.symbol : tokensValue.tokenA.symbol
								}
								onChange={(tokenSymbol) =>
									setTempTokenA({ ...tempTokenA, symbol: tokenSymbol })
								}
								placeholder="type token symbol & use arrow keys to select hint"
							/>
							<Text color="gray"> Case Sensitive!</Text>
						</>
					) : (
						<Text color="cyan">{tokensValue.tokenA.symbol}</Text>
					)}
				</Text>

				<Box>
					{!tokensIsSet.tokenA && tempTokenA?.symbol?.length > 1 && (
						<SelectInput
							items={tokens
								.map((t) => ({ label: t.symbol, value: t.address }))
								.filter((t) => t.label.includes(tempTokenA.symbol))}
							limit={4}
							onSelect={(tokenSymbol) => handleSubmit("tokenA", tokenSymbol)}
						/>
					)}
				</Box>

				{strategy === "pingpong" && (
					<>
						<Text>
							Token B:{" "}
							{tokensIsSet.tokenA && !tokensIsSet.tokenB ? (
								<>
									<TextInput
										value={
											tempTokenB ? tempTokenB.symbol : tokensValue.tokenB.symbol
										}
										onChange={(tokenSymbol) =>
											setTempTokenB({ ...tempTokenB, symbol: tokenSymbol })
										}
										placeholder="type token symbol & use arrow keys to select hint"
									/>
									<Text color="gray"> Case Sensitive!</Text>
								</>
							) : (
								<Text color="cyan">{tokensValue.tokenB.symbol}</Text>
							)}
						</Text>
						<Box>
							{!tokensIsSet.tokenB && tempTokenB?.symbol?.length > 1 && (
								<SelectInput
									items={tokens
										.map((t) => ({ label: t.symbol, value: t.address }))
										.filter((t) => t.label.includes(tempTokenB.symbol))}
									limit={4}
									onSelect={(tokenSymbol) =>
										handleSubmit("tokenB", tokenSymbol)
									}
								/>
							)}
						</Box>
					</>
				)}
			</Box>
		</Box>
	);
}
module.exports = Tokens;
