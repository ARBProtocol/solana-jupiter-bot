import { PublicBot } from "src/bot";
import { z } from "zod";

// export type Token = Token & {
// 	publicKey: PublicKey;
// };

// TODO: catch errors
// TODO: validate tokens with zod

/**
 * Load (fetch) tokens using the aggregator getTokens method
 */
export const loadTokens = async (bot: PublicBot) => {
	bot.logger.info("loadings tokens");

	if (!bot.aggregators[0].getTokens) {
		const msg =
			"loadTokens: aggregator.getTokens not defined, this will be optional in the future";
		bot.logger.error(msg);
		throw new Error(msg);
	}

	const aggregatorTokens = await bot.aggregators[0].getTokens();

	if (!aggregatorTokens || aggregatorTokens?.length === 0) {
		const msg = "loadTokens: aggregatorTokens not defined or empty";
		bot.logger.error(msg);
		throw new Error(msg);
	}

	bot.logger.debug(
		{
			aggregatorTokensSample: aggregatorTokens[0],
		},
		"loadTokens: aggregatorTokens sample"
	);

	const tokensInfo = aggregatorTokens.map((token) => {
		if (z.number().safeParse(token?.decimals).success === false) {
			const msg = `loadTokens: token.decimals not defined for token ${token.address}`;
			bot.logger.error(msg);
			bot.logger.debug({ token }, msg);
			throw new Error(msg);
		}

		return token;
	});

	bot.aggregators[0].tokens = tokensInfo;

	bot.logger.info(`${aggregatorTokens.length} tokens loaded`);
	bot.logger.debug({ aggregatorTokensSample: aggregatorTokens.slice(0, 2) });
};
