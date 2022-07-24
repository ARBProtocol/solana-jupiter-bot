const { Box, Text } = require("ink");
const { useContext } = require("react");
const React = require("react");
const WizardContext = require("../WizardContext");
const Menu = () => {
	const { nav } = useContext(WizardContext);
	return (
		<Box
			width="10%"
			minWidth={6}
			flexDirection="column"
			justifyContent="center"
			alignItems="flex-end"
		>
			{nav.steps.map((step, index) => {
				const isActive = index === nav.currentStep;
				return (
					<Text
						dimColor={!isActive}
						bold={isActive}
						underline={isActive}
						backgroundColor={isActive && "#481fde"}
						key={index}
					>
						{step}
					</Text>
				);
			})}
		</Box>
	);
};

module.exports = Menu;
