"use strict";

require("dotenv").config();
const React = require("react");
const { Text, Box, useApp, useInput, Newline, useStdin } = require("ink");
const { useState, useEffect } = require("react");
const { default: SelectInput } = require("ink-select-input");
const fs = require("fs");

// import components
const importJsx = require("import-jsx");
const { default: axios } = require("axios");
const { TOKEN_LIST_URL } = require("@jup-ag/core");
const { default: Spinner } = require("ink-spinner");
const { default: TextInput } = require("ink-text-input");
const BigText = require("ink-big-text");
const Gradient = require("ink-gradient");
const DefaultBox = importJsx("../Components/DefaultBox");

const EscNotification = importJsx("../Components/EscNotification");
const TabNotification = importJsx("../Components/TabNotification");

const networks = [
	{ label: "mainnet-beta", value: "mainnet-beta" },
	{ label: "testnet", value: "testnet" },
	{ label: "devnet", value: "devnet" },
];

const tradingModes = [
	{ label: "pingpong", value: "pingpong" },
	{ label: "arbitrage (coming soon)", value: "arbitrage" },
];

const App = (props) => {
	const [network, setNetwork] = useState(props.network || "");
	const [rpcURL, setRpcURL] = useState(props.rpc);
	const [rpc, setRpc] = useState([]);
	const [isRpcsSet, setIsRpcsSet] = useState(false);
	const [tradingMode, setTradingMode] = useState("");
	const [tokens, setTokens] = useState([]);
	const [tokenA, setTokenA] = useState({});
	const [tokenB, setTokenB] = useState({});
	const [tokenAisSet, setTokenAisSet] = useState(false);
	const [tokenBisSet, setTokenBisSet] = useState(false);
	const [tradingEnabled, setTradingEnabled] = useState(undefined);
	const [tradeSize, setTradeSize] = useState("");
	const [minPercProfit, setMinPercProfit] = useState("1");
	const [isMinPercProfitSet, setIsMinPercProfitSet] = useState(false);
	const [minInterval, setMinInterval] = useState("30");
	const [storeFailedTxInHistory, setStoreFailedTxInHistory] = useState(true);
	const [readyToStart, setReadyToStart] = useState(false);

	const { exit } = useApp();

	useInput((input, key) => {
		if (key.escape) exit();
		if (key.tab && !isRpcsSet) {
			setRpc([process.env.DEFAULT_RPC]);
			setIsRpcsSet(true);
		}
		if (readyToStart && key.return) {
			const config = {
				tokenA,
				tokenB,
				tradingMode,
				tradeSize: parseFloat(tradeSize),
				network,
				rpc,
				minPercProfit: parseFloat(minPercProfit),
				minInterval: parseInt(minInterval),
				tradingEnabled,
				storeFailedTxInHistory,
				ui: {
					defaultColor: "cyan",
				},
			};

			// save config to config.json file
			fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

			// save tokenst to tokens.json file
			fs.writeFileSync("./temp/tokens.json", JSON.stringify(tokens, null, 2));
			exit();
		}
	});

	const { setRawMode } = useStdin();

	useEffect(() => {
		setRawMode(true);

		return () => {
			setRawMode(false);
		};
	});

	useEffect(() => {
		network != "" &&
			axios.get(TOKEN_LIST_URL[network]).then((res) => setTokens(res.data));
	}, [network]);

	if (!network)
		return (
			<DefaultBox>
				<Text>
					Select Solana <Text color="magenta">Network</Text>:
				</Text>
				<SelectInput
					items={networks}
					onSelect={(item) => setNetwork(item.value)}
				/>
				<EscNotification />
			</DefaultBox>
		);

	if (!isRpcsSet)
		return (
			<DefaultBox>
				<Text>
					Paste Solana <Text color="magenta">RPC</Text>:
				</Text>
				<TextInput
					onChange={(url) => setRpcURL(url)}
					value={rpcURL || ""}
					placeholder={
						process.env.DEFAULT_RPC
							? process.env.DEFAULT_RPC
							: "https://my-super-expensive-quick-af-rpc.com"
					}
					onSubmit={(url) => {
						setRpc([...rpc, url]);
						setRpcURL("");
					}}
				/>
				<Newline />
				{rpc.map((url, index) => (
					<Text
						color={index === 0 ? "yellowBright" : "green"}
						dimColor={index === 0 ? false : true}
						key={index}
					>
						<Text color="gray">{index === 0 ? "MAIN" : `${index + 1}. `}</Text>{" "}
						{url}
					</Text>
				))}
				<Box justifyContent="space-between">
					{process.env.DEFAULT_RPC && rpc.length === 0 && (
						<TabNotification skip={true} />
					)}
					{rpc.length > 0 && <TabNotification />}

					<EscNotification />
				</Box>
			</DefaultBox>
		);

	if (!tradingMode)
		return (
			<DefaultBox>
				<Text>
					Choose <Text color="cyan">Trading Mode</Text>:
				</Text>
				<SelectInput
					items={tradingModes}
					onSelect={(item) => setTradingMode(item.value)}
				/>
				<EscNotification />
			</DefaultBox>
		);

	if (!readyToStart) {
		return (
			<DefaultBox>
				<Text>Config</Text>
				<Text>
					Network: <Text color="magenta">{network}</Text>
				</Text>
				<Text>
					Trading Mode: <Text color="cyan">{tradingMode}</Text>
				</Text>
				{tokens?.length > 0 ? (
					<>
						<Text>
							Available Tokens:{" "}
							<Text color="yellowBright">{tokens?.length || 0}</Text>
						</Text>

						{/* SET TOKEN A */}
						<Text>
							Token A:{" "}
							{!tokenAisSet ? (
								<>
									<TextInput
										value={tokenA?.symbol || ""}
										onChange={(value) => setTokenA({ symbol: value })}
										placeholder="type token symbol & use arrow keys to select hint"
										focus={!tokenAisSet}
										onSubmit={() => setTokenAisSet(true)}
									/>
									<Text color="gray"> Case Sensitive!</Text>
								</>
							) : (
								<Text color="cyan">{tokenA?.symbol}</Text>
							)}
						</Text>

						{tokenA?.symbol?.length > 1 && !tokenA?.address && (
							<SelectInput
								items={tokens
									.map((t) => ({ label: t.symbol, value: t.address }))
									.filter((t) => t.label.includes(tokenA.symbol))}
								limit={4}
								onSelect={(s) => setTokenA({ ...tokenA, address: s.value })}
							/>
						)}
						{tokenA?.address && (
							<Text>
								Token A Address:{" "}
								<Text color="yellowBright">{tokenA?.address}</Text>
							</Text>
						)}

						{/* SET TOKEN B */}
						<Text>
							Token B:{" "}
							{!tokenBisSet ? (
								<>
									<TextInput
										value={tokenB?.symbol || ""}
										onChange={(value) => setTokenB({ symbol: value })}
										placeholder="type token symbol & use arrow keys to select hint"
										focus={
											tokenB?.address ? false : tokenA?.address ? true : false
										}
										onSubmit={() => setTokenBisSet(true)}
									/>
									<Text color="gray"> Case Sensitive!</Text>
								</>
							) : (
								<Text color="cyan">{tokenB?.symbol}</Text>
							)}
						</Text>
						{tokenB?.symbol?.length > 1 &&
							tokenA?.address &&
							!tokenB?.address && (
								<SelectInput
									items={tokens
										.map((t) => ({ label: t.symbol, value: t.address }))
										.filter((t) => t.label.includes(tokenB.symbol))}
									limit={4}
									onSelect={(s) => setTokenB({ ...tokenB, address: s.value })}
								/>
							)}
						{tokenB?.address && (
							<Text>
								Token B Address:{" "}
								<Text color="yellowBright">{tokenB?.address}</Text>
							</Text>
						)}
					</>
				) : (
					<Text>
						Available Tokens: <Spinner type="dots" />
					</Text>
				)}
				<Newline />

				{tokenAisSet && tokenBisSet && (
					<Box flexDirection={tradingEnabled === undefined ? "column" : "row"}>
						<Text>Allow Trading: </Text>
						{tradingEnabled === undefined ? (
							<SelectInput
								items={[
									{ label: "true", value: true },
									{ label: "false", value: false },
								]}
								onSelect={(item) => setTradingEnabled(item.value)}
								itemComponent={(item) => (
									<Text color={tradingEnabled == item.value ? "cyan" : "gray"}>
										{item.label}
									</Text>
								)}
								onHighlight={(item) => (
									<Text color={tradingEnabled == item.value ? "cyan" : "gray"}>
										{tradingEnabled == item.value ? ">" : " "}
										{item.label}
									</Text>
								)}
							/>
						) : (
							<Text color="cyan">{tradingEnabled ? "true" : "false"}</Text>
						)}
					</Box>
				)}

				{tokenAisSet && tokenBisSet && tradingEnabled !== undefined && (
					<>
						<Box>
							<Text>Min. % Profit: </Text>
							{!isMinPercProfitSet ? (
								<TextInput
									value={minPercProfit || ""}
									onChange={(value) => setMinPercProfit(value)}
									placeholder="example 0.10"
									onSubmit={() => setIsMinPercProfitSet(true)}
								/>
							) : (
								<Text color="cyan">{minPercProfit}</Text>
							)}
						</Box>

						{isMinPercProfitSet && (
							<Box>
								<Text>Trade Size: </Text>
								<TextInput
									value={tradeSize || ""}
									onChange={(value) => setTradeSize(value)}
									placeholder="example 0.10"
									onSubmit={() => setReadyToStart(true)}
								/>
							</Box>
						)}
					</>
				)}

				<EscNotification />
			</DefaultBox>
		);
	}

	if (readyToStart) {
		return (
			<DefaultBox>
				<Gradient name="atlas">
					<BigText text="press enter" />
					<BigText text="to start" />
				</Gradient>
			</DefaultBox>
		);
	}

	return <DefaultBox></DefaultBox>;
};

module.exports = App;
