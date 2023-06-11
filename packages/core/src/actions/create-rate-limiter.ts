export const createRateLimiter = ({
	max,
	timeWindowMs,
	onLimit,
	onAllow,
}: {
	max: number;
	timeWindowMs: number;
	onLimit?: (current: number) => void;
	onAllow?: (current: number) => void;
}) => {
	const queue: number[] = [];

	return {
		shouldAllow(timestamp: number): boolean {
			const diff = timestamp - timeWindowMs;
			// @ts-expect-error it's fine
			while (queue[queue.length - 1] <= diff) {
				queue.pop();
			}
			if (queue.length < max) {
				queue.unshift(timestamp);
				if (onAllow) onAllow(queue.length);
				return true;
			} else {
				if (onLimit) onLimit(queue.length);
				return false;
			}
		},
	};
};
