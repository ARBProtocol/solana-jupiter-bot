const { useInput } = require("ink");
const React = require("react");
const { useReducer } = require("react");
const initialState = require("./initialState");
const reducer = require("./reducer");
const WizardContext = require("./WizardContext");

const WizardProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	useInput((input, key) => {
		if (input === "]") dispatch({ type: "NEXT_STEP" });
		if (input === "[") dispatch({ type: "PREV_STEP" });
	});

	const configSetValue = (key, value, goToNextStep = true) => {
		dispatch({ type: "CONFIG_SET", key, value });
		goToNextStep && dispatch({ type: "NEXT_STEP" });
	};

	const configSwitchState = (key, value) => {
		dispatch({ type: "CONFIG_SWITCH_STATE", key, value });
	};

	const providerValue = {
		...state,
		configSetValue,
		configSwitchState,
	};
	return (
		<WizardContext.Provider value={providerValue}>
			{children}
		</WizardContext.Provider>
	);
};

module.exports = WizardProvider;
