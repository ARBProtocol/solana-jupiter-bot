module.exports = {
	root: true,
	// This tells ESLint to load the config from the package `eslint-config-custom`
	extends: ["custom"],
	rules: {
		"turbo/no-undeclared-env-vars": "off",
	},
};
