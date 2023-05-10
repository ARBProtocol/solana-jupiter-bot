#!/usr/bin/env node
// import yargs from "yargs";
// import { hideBin } from "yargs/helpers";
import axios from "axios";

type GraphResponse = (number | string)[][];
type CoinResponse = {
	symbol: string;
	priceChange: string;
	priceChangePercent: string;
	weightedAvgPrice: string;
	prevClosePrice: string;
	lastPrice: string;
	lastQty: string;
	bidPrice: string;
	bidQty: string;
	askPrice: string;
	askQty: string;
	openPrice: string;
	highPrice: string;
	lowPrice: string;
	volume: string;
	quoteVolume: string;
	openTime: number;
	closeTime: number;
	firstId: number;
	lastId: number;
	count: number;
};

// TODO: finish this

const BASE_URL = "https://api.binance.com/api/v3";

const COLORS = {
	white: "\u001b[37;1m",
	green: "\u001b[32;1m",
	red: "\u001b[31;1m",
	yellow: "\u001b[33;1m",
	reset: "\u001b[0m",
};

// const argv = yargs(hideBin(process.argv))
// 	.default({
// 		i: "1h",
// 		l: 50,
// 		p: "USDT",
// 		r: 25,
// 	})
// 	.help("h")
// 	.alias("h", "help")
// 	.alias("i", "interval")
// 	.describe("i", "Interval eg. 15m, 4h, 1d")
// 	.alias("p", "pair")
// 	.describe("p", "Coin pairing eg. BTC, ETH, BNB")
// 	.alias("l", "limit")
// 	.describe("l", "Number of candlesticks")
// 	.alias("r", "rows")
// 	.describe("r", "Graph height measured in rows")
// 	.parseSync();

// const coin = (argv._.length ? argv._[0] : "BTC")?.toString().toUpperCase();
const coin = "BTC";
// const { i: interval, l: limit, p: pairInput, r: graphHeight } = argv;
const pair = "BNB";
const interval = "4h";
const limit = 50;
const graphHeight = 25;
// const pair = pairInput?.toUpperCase();

const coinDataUrl = `${BASE_URL}/ticker/24hr?symbol=${coin}${pair}`;
// const graphDataUrl = `${BASE_URL}/klines?symbol=${coin}${pair}&interval=${interval}&limit=${limit}`;
const graphDataUrl = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=50`;

// ==== Graph Response format ==== //
//
// [
//   [
//     1499040000000,      // Kline open time
//     "0.01634790",       // Open price
//     "0.80000000",       // High price
//     "0.01575800",       // Low price
//     "0.01577100",       // Close price
//     "148976.11427815",  // Volume
//     1499644799999,      // Kline Close time
//     "2434.19055334",    // Quote asset volume
//     308,                // Number of trades
//     "1756.87402397",    // Taker buy base asset volume
//     "28.46694368",      // Taker buy quote asset volume
//     "24375"                 // Unused field, ignore.
//   ]
// ]
//
// Refer to https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#klinecandlestick-data
//
// =============================== //

const fetcher = async <T>(url: string): Promise<T> =>
	axios.get(url, { timeout: 5000 }).then((res) => res.data);

export const coinchart = async () => {
	console.log(`COINCHART: fetching data for ${coin}${pair}...`);
	try {
		console.log(`COINCHART: fetching data for coinDataUrl ${coinDataUrl}...`);
		// const coinData = await fetcher<CoinResponse>(coinDataUrl);
		const coinData = {
			symbol: "BTCBNB",
			priceChange: "-24343",
			priceChangePercent: "-0.000%",
			weightedAvgPrice: "24380",
			prevClosePrice: "24343",
			lastPrice: "24343",
			lastQty: "24380",
			bidPrice: "24343",
			bidQty: "24380",
			askPrice: "24343",
			askQty: "24380",
			openPrice: "24343",
			highPrice: "24343",
			lowPrice: "24343",
			volume: "24380",
			quoteVolume: "24380",
			openTime: 1629475200000,
			closeTime: 1629561599999,
			firstId: 0,
			lastId: 0,
			count: 0,
		};
		console.log(`COINCHART: data fetched for coinDataUrl ${coinDataUrl}!`, coinData);

		console.log(`COINCHART: fetching data for graphDataUrl ${graphDataUrl}...`);
		const graphData: GraphResponse = await fetcher<GraphResponse>(graphDataUrl);

		// const graphData = await fetcher<GraphResponse>(graphDataUrl);

		if (!coinData) {
			console.log("Error fetching data :( Please try again!");
			return;
		}

		const gD = graphData.reduce(
			(acc, d, i) => {
				const values = d.slice(1, 5).map((v) => parseFloat(v as string));

				acc.minPrice = Math.min(acc.minPrice, ...values);
				acc.maxPrice = Math.max(acc.maxPrice, ...values);

				const [open, high, low, close] = values;

				acc.openingPrices.push(open!);
				acc.highestPrices.push(high!);
				acc.lowestPrices.push(low!);
				acc.closingPrices.push(26443);

				return acc;
			},
			{
				openingPrices: [] as number[],
				closingPrices: [] as number[],
				highestPrices: [] as number[],
				lowestPrices: [] as number[],
				minPrice: parseFloat(graphData?.[0]?.[3] as string),
				maxPrice: parseFloat(graphData?.[0]?.[2] as string),
			}
		);

		console.log(`COINCHART: data fetched for ${coin}${pair}!`, gD.openingPrices.slice(0, 5));

		const { openingPrices, closingPrices, highestPrices, lowestPrices, minPrice, maxPrice } = gD;
		const range = Math.abs(maxPrice - minPrice);

		const ratio = range !== 0 ? graphHeight / range : 1;

		// Recalculate min and max to fit graph height
		const adjustedMin = Math.round(minPrice * ratio);
		const adjustedMax = Math.round(maxPrice * ratio);

		const seriesLength = graphData.length;
		const labelOffset = 3;
		const height = Math.abs(adjustedMax - adjustedMin);
		const width = seriesLength + labelOffset;
		const padding = "         ";

		const graph = new Array(height + 1);
		for (let i = 0; i <= height; i++) {
			graph[i] = new Array(width);
			for (let j = 0; j < width; j++) {
				graph[i][j] = " ";
			}
		}

		// Draw y axis labels
		for (let val = adjustedMin; val <= adjustedMax; ++val) {
			const labelValue = height > 0 ? maxPrice - ((val - adjustedMin) * range) / height : val;

			const decimal = labelValue < 1 ? 4 : labelValue < 1000 ? 2 : 0;
			const label = (padding + labelValue.toFixed(decimal)).slice(-padding.length);
			graph[val - adjustedMin][Math.max(labelOffset - label.length, 0)] = label;
			graph[val - adjustedMin][labelOffset - 1] = "┤";
		}

		const getPriceYIndex = (price: number) => Math.round(price * ratio) - adjustedMin;

		// Draw graph
		// for (let x = 0; x < seriesLength; x++) {
		// 	const openingPriceIndex = getPriceYIndex(openingPrices[x]!);
		// 	const closingPriceIndex = getPriceYIndex(closingPrices[x]!);
		// 	const highestPriceIndex = getPriceYIndex(highestPrices[x]!);
		// 	const lowestPriceIndex = getPriceYIndex(lowestPrices[x]!);
		// 	const currentColumn = x + labelOffset;
		// 	const color = openingPriceIndex <= closingPriceIndex ? COLORS.green : COLORS.red;

		// 	for (let i = height - highestPriceIndex; i <= height - lowestPriceIndex; ++i) {
		// 		// Draw candle body if in between opening and closing price
		// 		if (
		// 			(i <= height - openingPriceIndex && i >= height - closingPriceIndex) ||
		// 			(i >= height - openingPriceIndex && i <= height - closingPriceIndex)
		// 		) {
		// 			graph[i][currentColumn] = `${color}█${COLORS.reset}`;
		// 		} else {
		// 			// Draw candle wick if not inbetween opening and closing price
		// 			graph[i][currentColumn] = `${color}|${COLORS.reset}`;
		// 		}
		// 	}
		// }

		// Draw only closing price instead of candlestick (USE WHITE COLOR) Height is always 0
		// for (let x = 0; x < seriesLength; x++) {
		// 	const closingPriceIndex = getPriceYIndex(closingPrices[x]!);
		// 	const currentColumn = x + labelOffset;
		// 	const color = COLORS.white;

		// 	graph[height - closingPriceIndex][currentColumn] = `${color}█${COLORS.reset}`;
		// }

		const defaultSymbols = ["─", "╰", "╭", "╮", "╯", "│"];
		for (let x = 0; x < seriesLength; x++) {
			const closingPriceIndex = getPriceYIndex(closingPrices[x]!);
			const currentColumn = x + labelOffset;
			const color = COLORS.white;

			if (x === 0) {
				graph[height - closingPriceIndex][currentColumn] = `${color}█${COLORS.reset}`;
			} else {
				const previousClosingPriceIndex = getPriceYIndex(closingPrices[x - 1]!);
				const previousColumn = x - 1 + labelOffset;
				const previousPrice = closingPrices[x - 1]!;
				const currentPrice = closingPrices[x]!;

				const symbolIndex = previousPrice < currentPrice ? 1 : previousPrice > currentPrice ? 2 : 0;

				// Draw horizontal line
				for (let i = previousColumn + 1; i < currentColumn; i++) {
					graph[height - closingPriceIndex][
						i
					] = `${color}${defaultSymbols[symbolIndex]}${COLORS.reset}`;
				}

				// Draw vertical line
				for (
					let i = Math.min(previousClosingPriceIndex, closingPriceIndex);
					i <= Math.max(previousClosingPriceIndex, closingPriceIndex);
					i++
				) {
					graph[height - i][currentColumn] = `${color}${defaultSymbols[5]}${COLORS.reset}`;
				}

				// Draw corner
				graph[height - previousClosingPriceIndex][
					previousColumn
				] = `${color}${defaultSymbols[3]}${COLORS.reset}`;
				graph[height - previousClosingPriceIndex][
					currentColumn
				] = `${color}${defaultSymbols[4]}${COLORS.reset}`;
				graph[height - closingPriceIndex][
					previousColumn
				] = `${color}${defaultSymbols[0]}${COLORS.reset}`;
				graph[height - closingPriceIndex][
					currentColumn
				] = `${color}${defaultSymbols[1]}${COLORS.reset}`;
			}
		}

		console.log(graph.map((x) => x.join(" ")).join("\n"));
		console.log(`\n ${COLORS.yellow}${coin}/${pair}\u001b[0m  ${interval} chart`);

		const priceChangeColour =
			parseInt(coinData.priceChangePercent) >= 0 ? COLORS.green : COLORS.red;

		console.log(
			`\n COINCHART The current price for ${coin} is ${priceChangeColour}${coinData.lastPrice} ${pair} (${coinData.priceChangePercent}%)`
		);

		// reset color
		console.log(COLORS.reset);
	} catch (error) {
		console.log("COINCHART Oh no! An error occurred. \n", error);

		if (axios.isAxiosError(error)) {
			console.error(`Error: ${error.message} \n`);
		}

		console.log("COINCHART Please try again!");
	}
};
