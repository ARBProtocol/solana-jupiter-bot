import * as asciichart from "asciichart";

import { GlobalState } from "@arb-protocol/core";

export const Chart = ({
	state,
	chartKeys,
	height = 4,
	entries,
}: {
	state: GlobalState;
	chartKeys: Partial<keyof GlobalState["chart"]>[];
	height?: number;
	entries?: number;
}) => {
	const chartData = [];
	const chartConfig = {
		height,
		// padding: " ".repeat(8),
		colors: [undefined] as (string | undefined)[],
	};

	for (const chartKey of chartKeys) {
		// get last n entries from state.chart[chartKey].values
		const values = entries
			? state.chart[chartKey].values.slice(-entries)
			: state.chart[chartKey].values;

		chartData.push(values);

		const indicators = state.chart[chartKey].indicators;

		if (indicators) {
			for (const indicator of indicators) {
				chartData.push(indicator.values);
				const c = (indicator.color || "darkgrey") as keyof typeof asciichart;
				const color = asciichart[c] as string;
				chartConfig.colors.push(color);
			}
		}
	}

	return asciichart.plot(chartData, chartConfig);
};
