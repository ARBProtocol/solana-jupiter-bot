"use strict";

require("dotenv").config();
const React = require("react");
const { Text, Box, useApp, useInput, Newline, useStdin } = require("ink");
const { useState, useContext, useEffect } = require("react");
const { default: SelectInput } = require("ink-select-input");
const fs = require("fs");

// create temp dir
const { createTempDir } = require("../utils");
createTempDir();

// import components
const importJsx = require("import-jsx");
const { default: axios } = require("axios");
const { TOKEN_LIST_URL } = require("@jup-ag/core");
const { default: Spinner } = require("ink-spinner");
const { default: TextInput } = require("ink-text-input");
const BigText = require("ink-big-text");
const Gradient = require("ink-gradient");
const WizardContext = require("./WizardContext");
const WizardProvider = importJsx("./WizardProvider");

const Layout = importJsx("./Components/Layout");

const EscNotification = importJsx("./Components/EscNotification");
const TabNotification = importJsx("./Components/TabNotification");

const networks = [
	{ label: "mainnet-beta", value: "mainnet-beta" },
	{ label: "testnet", value: "testnet" },
	{ label: "devnet", value: "devnet" },
];

const tradingStrategies = [
	{ label: "pingpong", value: "pingpong" },
	{ label: "arbitrage (beta)", value: "arbitrage" },
];

const initialConfigState = {
	network: "",
	rpcUrl: "",
};

const initialNavState = {
	currentStep: 0,
	steps: ["network", "rpc", "strategy", "tokens"],
};

const App = (props) => {
	const [network, setNetwork] = useState(props.network || "");
	const [rpcURL, setRpcURL] = useState(props.rpc);
	const [rpc, setRpc] = useState([]);
	const [isRpcsSet, setIsRpcsSet] = useState(false);
	const [tradingStrategy, setTradingStrategy] = useState("");
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

	return (
		<WizardProvider>
			<Layout></Layout>
		</WizardProvider>
	);
};

module.exports = App;
