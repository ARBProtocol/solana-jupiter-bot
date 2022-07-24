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

		case "CONFIG_SWITCH_STATE":
			return {
				...prevState,
				config: {
					...prevState.config,
					[action.key]: {
						state: {
							...prevState.config[action.key].state,
							items: prevState.config[action.key].state.items.map((item) =>
								item.value === action.value
									? {
											...item,
											isSelected: !item.isSelected,
									  }
									: item
							),
						},
						isSet: true,
					},
				},
			};

		default:
			throw new Error(`Unhandled action type: ${action.type}`);
	}
};

module.exports = reducer;
