const reducer = (prevState, action) => {
	switch (action.type) {
		case "NEXT_STEP":
			return {
				...prevState,
				nav: {
					...prevState.nav,
					currentStep: prevState.nav.currentStep + 1,
				},
			};
		case "PREV_STEP":
			return {
				...prevState,
				nav: {
					...prevState.nav,
					currentStep: prevState.nav.currentStep - 1,
				},
			};
		case "CONFIG_SET":
			return {
				...prevState,
				config: {
					...prevState.config,
					[action.key]: {
						...prevState.config[action.key],
						value: action.value,
						isSet: true,
					},
				},
			};

		default:
			throw new Error(`Unhandled action type: ${action.type}`);
	}
};

module.exports = reducer;
