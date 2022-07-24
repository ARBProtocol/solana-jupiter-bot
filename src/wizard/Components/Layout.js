const React = require("react");
const { Box, Text } = require("ink");

const importJsx = require("import-jsx");
const { useContext } = require("react");
const WizardContext = require("../WizardContext");
const IntroTitle = importJsx("./IntroTitle");
const Main = importJsx("./Main");

const Layout = () => {
	const { nav } = useContext(WizardContext);
	return (
		<Box padding={1} justifyContent="flex-start" flexDirection="row">
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
			<Box
				width="50%"
				minWidth={100}
				borderColor="#481fde"
				borderStyle="bold"
				padding={1}
				flexDirection="column"
			>
				<IntroTitle />
				<Main></Main>
			</Box>
		</Box>
	);
};

module.exports = Layout;
