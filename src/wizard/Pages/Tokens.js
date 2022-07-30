const React = require("react");
const { Box, Text } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext, useState, useEffect } = require("react");
const { default: SelectInput } = require("ink-select-input");
const chalk = require("chalk");
const { default: axios } = require("axios");
const { TOKEN_LIST_URL } = require("@jup-ag/core");
const { default: TextInput } = require("ink-text-input");
const fs = require("fs");

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
	const [autocompleteTokens, setAutocompleteTokens] = useState([]);
	const [tempTokensValue, setTempTokensValue] = useState({
		tokenA: undefined,
		tokenB: undefined,
	});

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

	const handleTokenChange = (tokenId, value) => {
		const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
		const filteredTokens = tokens
			.map((t) => ({
				label: t.symbol,
				value: t.address,
			}))
			.filter((t) =>
				t.label.toLowerCase().includes(sanitizedValue.toLowerCase())
			);
		setAutocompleteTokens(filteredTokens);
		setTempTokensValue({
			...tempTokensValue,
			[tokenId]: {
				symbol: sanitizedValue,
			},
		});
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
									tempTokensValue.tokenA
										? tempTokensValue.tokenA.symbol
										: tokensValue.tokenA.symbol
								}
								onChange={(tokenSymbol) =>
									handleTokenChange("tokenA", tokenSymbol)
								}
								placeholder="type token symbol & use arrow keys to select hint"
							/>
						</>
					) : (
						<Text color="cyan">{tokensValue.tokenA.symbol}</Text>
					)}
				</Text>

				<Box>
					{!tokensIsSet.tokenA &&
						tempTokensValue?.tokenA?.symbol?.length > 1 && (
							<SelectInput
								items={autocompleteTokens}
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
											tempTokensValue.tokenB
												? tempTokensValue.tokenB.symbol
												: tokensValue.tokenB.symbol
										}
										onChange={(tokenSymbol) =>
											handleTokenChange("tokenB", tokenSymbol)
										}
										placeholder="type token symbol & use arrow keys to select hint"
									/>
								</>
							) : (
								<Text color="cyan">{tokensValue.tokenB.symbol}</Text>
							)}
						</Text>
						<Box>
							{!tokensIsSet.tokenB &&
								tempTokensValue.tokenB?.symbol?.length > 1 && (
									<SelectInput
										items={autocompleteTokens}
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
