import gradient from "gradient-string";

type ChartOptions = {
	range?: string[];
	stringify?: boolean;
};

type PlotOptions = {
	stringify?: boolean;
};

const createMicroBarChart = (options: ChartOptions = {}) => {
	const range = options.range || ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

	const plot = (values: number[], options: PlotOptions = {}) => {
		const m = Math.min(...values);
		const n = (Math.max(...values) - m) / (range.length - 1);
		const columns = values.map((value) => range[Math.floor((value - m) / n)]);
		return options.stringify ? columns.join("") : columns;
	};

	return { plot };
};

/**
 * Renders a micro bar chart.
 * @example
 * ▂▅▂▁▂▄▅▅▅▂▅▂▂▄▁▂▂▂▄▂▄▅█▄
 */
export const MicroBarChart = (values: number[], gradientColors?: string[]) => {
	const chart = createMicroBarChart();
	const ch = chart.plot(values, { stringify: true });

	return gradientColors ? gradient(gradientColors)(ch as string) : ch;
};
