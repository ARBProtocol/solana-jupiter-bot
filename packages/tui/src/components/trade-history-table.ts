import { GlobalState } from "@arb-protocol/core";
import { TradeHistoryEntry } from "@arb-protocol/core";
import chalk from "chalk";
import cliTable from "cli-table3";
import { uiStore } from "../ui-store";

interface Column {
	accessor: keyof TradeHistoryEntry;
	header: string;
	width: number;
	align: "left" | "right";
	formatter?: <T>(value: T) => string | number;
}

export const TradeHistoryTable = (state: GlobalState) => {
	const uiState = uiStore.getState();
	const { x, y, active: isTableCursorActive } = uiState.tradeHistoryTable.cursor;

	const columns: Column[] = [
		{
			accessor: "createdAt",
			header: "Timestamp",
			width: 15,
			align: "left",
		},
		{
			accessor: "inUiAmount",
			header: "In Amount",
			width: 20,
			align: "right",
		},
		{
			accessor: "inTokenSymbol",
			header: "In Token",
			width: 10,
			align: "left",
			formatter: (value) => {
				return uiState.enableIncognitoMode ? chalk.white.dim("###") : String(value);
			},
		},
		{
			accessor: "outUiAmount",
			header: "Out Amount",
			width: 20,
			align: "right",
		},
		{
			accessor: "outTokenSymbol",
			header: "Out Token",
			width: 10,
			align: "left",
			formatter: (value) => {
				return uiState.enableIncognitoMode ? chalk.white.dim("###") : String(value);
			},
		},
		{
			accessor: "profitPercent",
			header: "Profit %",
			width: 15,
			align: "right",
			formatter: (value) => {
				const v = Number(value);
				if (v === 0) return v.toFixed(6);
				return v > 0 ? chalk.green(v.toFixed(6)) : chalk.red(v.toFixed(6));
			},
		},
		{
			accessor: "status",
			header: "Status",
			width: 15,
			align: "left",
		},
		{
			accessor: "error",
			header: "error",
			width: 20,
			align: "left",
		},
	];

	const table = new cliTable({
		head: [
			...columns.map(({ header }, columnIndex) => {
				const isColumnActive = columnIndex === x && isTableCursorActive;

				return isColumnActive
					? chalk.white.inverse(header)
					: isTableCursorActive
					? chalk.white.dim(header)
					: chalk.white(header);
			}),
		],
		colAligns: columns.map(({ align }) => align),
		colWidths: columns.map(({ width }) => width),
	});

	// get last 5 trades
	const entries = Object.entries(state.tradeHistory).slice(uiState.tradeHistoryTable.maxRows * -1);
	const rows = entries.map(([_, trade], rowIndex) => {
		type Status = typeof trade.status;

		const row = columns.map(({ accessor, formatter }, columnIndex) => {
			let value = trade[accessor];

			const isRowActive = rowIndex === y;
			const isColumnActive = columnIndex === x;
			const isCellActive = isRowActive && isColumnActive && isTableCursorActive;

			if (accessor === "createdAt") {
				value = new Date(Number(trade[accessor]))
					.toLocaleString()
					.split(",")
					.join("\n")
					.replaceAll(" ", "");
			}

			// formatter
			if (formatter) {
				value = formatter(value);
			}

			if (accessor === "status") {
				const variants: {
					[key in Status]: string;
				} = {
					pending: chalk.yellow(trade[accessor]),
					success: chalk.green(trade[accessor]),
					error: chalk.red(trade[accessor]),
					unknown: chalk.red(trade[accessor]),
					fetchingResult: chalk.yellow(
						`solscan ${((performance.now() - trade.updatedAt) / 1000).toFixed(0)}s`
					),
				};
				value = variants[trade[accessor]];

				// show time elapsed for fetchingResult and pending status
				if ((["fetchingResult", "pending"] as Status[]).includes(trade.status)) {
					const timeElapsed = (Date.now() - trade.updatedAt) / 1000;
					value += chalk.yellow(`\n${timeElapsed.toFixed(0)} s`);
				}
			}

			if (accessor === "profitPercent") {
				if (
					!(["success", "error"] as Status[]).includes(trade.status) &&
					trade.unrealizedProfitPercent === undefined
				) {
					value = "...";
				}

				if (trade.status === "error") {
					value = "-";
				}

				if (trade.unrealizedProfitPercent !== undefined) {
					value += "\n" + chalk.dim(trade.unrealizedProfitPercent.toFixed(6));
				}
			}

			const cell = {
				content: isCellActive ? chalk.inverse(value) : value,
				style: {},
			};

			if (isCellActive) {
				cell.style = {
					border: ["magenta"],
				};
			}

			return cell;
		});

		return row;
	});

	table.push(...rows);

	const str = table.toString();

	return str;
};
