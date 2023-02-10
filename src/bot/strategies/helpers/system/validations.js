const validationsHelpers = {
	strategy: (base) => {
		validateCacheExists(base.data.cache, base.validations);
		validateConfigExists(base.data.cache.config, base.validations);
		validateTokensExist(base.data.tokens, base.validations);
		validateJupiterExist(base.jupiter, base.validations);
	},
};

function validateCacheExists(cache, validations) {
	if (!cache) throw new Error("Strategy missing `cache` object!");
	validations.cache = true;
}

function validateConfigExists(config, validations) {
	if (!config) throw new Error("Strategy missing `cache.config`!");
	validations.config = true;
}

function validateTokensExist(tokens, validations) {
	const hasTokens = Object.values(tokens).some((t) => t.value !== null);

	if (!hasTokens) throw new Error("Strategy missing `tokens` object!");
	validations.tokens = true;
}

function validateJupiterExist(jupiter, validations) {
	if (!jupiter) throw new Error("Strategy missing `Jupiter SDK`!");
	validations.jupiter = true;
}

module.exports = validationsHelpers;
