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
			network: { value: network },
			tokens: { value: tokensValue, isSet: tokensIsSet },
		},
		configSetValue,
	} = useContext(WizardContext);
	const [tokens, setTokens] = useState([]);
	const [tempTokenA, setTempTokenA] = useState();
	// const [tempTokenB, setTempTokenB] = useState();

	const handleSubmit = (tokenId, tokenValue) => {
		tokensIsSet[tokenId] = true;
		tokensValue[tokenId] = {
			symbol: tokenValue,
		};
		configSetValue("tokens", {
			value: tokensValue,
			isSet: tokensIsSet,
		});
	};

	useEffect(() => {
		axios.get(TOKEN_LIST_URL[network]).then((res) => setTokens(res.data));
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
			<Box margin={1}>
				<Text>
					Token A:{" "}
					{!tokensIsSet.tokenA ? (
						<>
							<TextInput
								value={tempTokenA ? tempTokenA : tokensValue.tokenA.symbol}
								// value={tokensValue?.tokenA?.symbol || "0"}
								onChange={(tokenSymbol) => setTempTokenA(tokenSymbol)}
								placeholder="type token symbol & use arrow keys to select hint"
								onSubmit={(tokenSymbol) => handleSubmit("tokenA", tokenSymbol)}
							/>
							<Text color="gray"> Case Sensitive!</Text>
						</>
					) : (
						<Text color="cyan">{tempTokenA}</Text>
					)}
				</Text>
			</Box>
		</Box>
	);
}
module.exports = Tokens;
