import { GlobalState } from "@arb-protocol/core";
import { TradeHistoryEntry } from "@arb-protocol/core/src/store";
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
			accessor: "timestamp",
			header: "Timestamp",
			width: 15,
			align: "left",
		},
		{
			accessor: "inAmount",
			header: "in Amount",
			width: 20,
			align: "right",
		},
		{
			accessor: "inToken",
			header: "in Token",
			width: 10,
			align: "left",
		},
		{
			accessor: "outAmount",
			header: "out Amount",
			width: 20,
			align: "right",
		},
		{
			accessor: "outToken",
			header: "out Token",
			width: 10,
			align: "left",
		},
		{
			accessor: "profitPercent",
			header: "profitPercent",
			width: 15,
			align: "right",
			formatter: (value) => {
				if (value === 0) return Number(value);
				return value > 0 ? chalk.green(value) : chalk.red(value);
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

	type Columns = typeof columns;

	// get last 5 trades
	const entries = Object.entries(state.tradeHistory).slice(-5);
	const rows = entries.map(([txId, trade], rowIndex) => {
		const row = columns.map(({ accessor, formatter }, columnIndex) => {
			let value = trade[accessor];

			const isRowActive = rowIndex === y;
			const isColumnActive = columnIndex === x;
			const isCellActive = isRowActive && isColumnActive && isTableCursorActive;

			if (accessor === "timestamp") {
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
				type Status = typeof trade.status;
				const variants: {
					[key in Status]: string;
				} = {
					pending: chalk.yellow(trade[accessor]),
					success: chalk.green(trade[accessor]),
					error: chalk.red(trade[accessor]),
					unknown: chalk.red(trade[accessor]),
					fetchingResult: chalk.yellow(
						`solscan ${((performance.now() - trade.statusUpdatedAt) / 1000).toFixed(0)}s`
					),
				};
				value = variants[trade[accessor]] || ".".repeat(Math.floor(Math.random() * 3));
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
