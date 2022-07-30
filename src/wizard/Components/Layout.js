const React = require("react");
const { Box } = require("ink");

const importJsx = require("import-jsx");

const WizardHeader = importJsx("./WizardHeader");
const Menu = importJsx("./Menu");
const Main = importJsx("./Main");

const Layout = () => {
	return (
		<Box padding={1} justifyContent="flex-start" flexDirection="row">
			<Menu />
			<Box
				width={80}
				minHeight={20}
				borderColor="#481fde"
				borderStyle="bold"
				padding={1}
				flexDirection="column"
			>
				<WizardHeader />
				<Main />
			</Box>
		</Box>
	);
};

module.exports = Layout;
