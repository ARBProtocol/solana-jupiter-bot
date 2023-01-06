import { GlobalState } from "@arb-protocol/core";
import * as asciichart from "asciichart";
export const Chart = (state: GlobalState, chartKeys: Partial<keyof GlobalState["chart"]>[]) => {
	const chartData = [];
	const chartConfig = {
		height: 4,
		padding: " ".repeat(8),
		colors: [undefined] as (string | undefined)[],
	};

	for (const chartKey of chartKeys) {
		chartData.push(state.chart[chartKey].values);

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
