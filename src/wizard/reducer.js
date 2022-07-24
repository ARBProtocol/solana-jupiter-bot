const reducer = (prevState, action) => {
	switch (action.type) {
		case "NEXT_STEP":
			return {
				...state,
				nav: {
					...state.nav,
					currentStep: state.nav.currentStep + 1,
				},
			};
		case "PREV_STEP":
			return {
				...state,
				nav: {
					...state.nav,
					currentStep: state.nav.currentStep - 1,
				},
			};
		case "CONFIG_SET":
			return {
				...state,
				config: {
					...state.config,
					[action.key]: {
						value: action.value,
						isSet: true,
					},
				},
			};

		default:
			return state;
	}
};

module.exports = {
	initialState,
	reducer,
};
