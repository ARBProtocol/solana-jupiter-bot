const React = require("react");
const importJsx = require("import-jsx");

const WizardContext = require("../WizardContext");
const { useContext } = require("react");

const Network = importJsx("../Pages/Network");
const Rpc = importJsx("../Pages/Rpc");

const ROUTES = {
	network: <Network />,
	rpc: <Rpc />,
};

const Router = () => {
	const { nav } = useContext(WizardContext);

	return <>{ROUTES[nav.steps[nav.currentStep]]}</>;
};
module.exports = Router;
