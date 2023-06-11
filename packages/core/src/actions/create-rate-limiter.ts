export const createRateLimiter = ({
	max,
	timeWindowMs,
	onLimit,
	onAllow,
	cooldownMs,
	onCooldown,
	onCooldownEnd,
}: {
	max: number;
	timeWindowMs: number;
	onLimit?: (current: number) => void;
	onAllow?: (current: number) => void;
	onCooldown?: (cooldownUntilRel: number) => void;
	onCooldownEnd?: () => void;
	cooldownMs?: number;
}) => {
	const queue: number[] = [];
	let cooldown = false;
	let cooldownUntilRel = 0;

	const activateCooldown = () => {
		if (!cooldownMs) return;

		cooldown = true;
		setTimeout(() => {
			cooldown = false;
			if (onCooldownEnd) onCooldownEnd();
		}, cooldownMs);
		cooldownUntilRel = performance.now() + cooldownMs;

		if (onCooldown) onCooldown(cooldownUntilRel);
	};

	const checkCooldown = () => {
		if (!cooldown) return;

		if (cooldownUntilRel <= performance.now()) {
			cooldown = false;
		}
	};

	return {
		shouldAllow(timestamp: number): boolean {
			const diff = timestamp - timeWindowMs;
			// @ts-expect-error it's fine
			while (queue[queue.length - 1] <= diff) {
				queue.pop();
			}

			if (cooldownMs) {
				checkCooldown();
				if (cooldown) {
					return false;
				}
			}

			if (queue.length < max) {
				if (onAllow) onAllow(queue.length);
				queue.unshift(timestamp);

				return true;
			} else {
				if (queue.length >= max && cooldownMs) activateCooldown();

				if (onLimit) onLimit(queue.length);
				return false;
			}
		},
	};
};
