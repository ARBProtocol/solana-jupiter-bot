const initialState = {
	nav: {
		currentStep: 0,
		steps: ["network", "rpc", "strategy", "tokens"],
	},
	test: 0,
};

const reducer = (state, action) => {
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
		default:
			return state;
	}
};

module.exports = {
	initialState,
	reducer,
};
