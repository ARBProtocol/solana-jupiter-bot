const React = require("react");
const { Box } = require("ink");

const importJsx = require("import-jsx");

const IntroTitle = importJsx("./IntroTitle");
const Menu = importJsx("./Menu");
const Main = importJsx("./Main");

const Layout = () => {
	return (
		<Box padding={1} justifyContent="flex-start" flexDirection="row">
			<Menu />
			<Box
				width="50%"
				minWidth={100}
				minHeight={20}
				borderColor="#481fde"
				borderStyle="bold"
				padding={1}
				flexDirection="column"
			>
				<IntroTitle />
				<Main />
			</Box>
		</Box>
	);
};

module.exports = Layout;
