const React = require("react");
const importJsx = require("import-jsx");

const WizardContext = require("../WizardContext");
const { useContext } = require("react");

const Network = importJsx("../Pages/Network");
const Rpc = importJsx("../Pages/Rpc");
const Strategy = importJsx("../Pages/Strategy");
const Tokens = importJsx("../Pages/Tokens");
const TradingSize = importJsx("../Pages/TradingSize");
const Profit = importJsx("../Pages/Profit");
const Slippage = importJsx("../Pages/Slippage");
const Advanced = importJsx("../Pages/Advanced");
const PriorityFee = importJsx("../Pages/PriorityFee");
const Confirm = importJsx("../Pages/Confirm");

const ROUTES = {
	network: <Network />,
	rpc: <Rpc />,
	strategy: <Strategy />,
	tokens: <Tokens />,
	"trading size": <TradingSize />,
	profit: <Profit />,
	slippage: <Slippage />,
	advanced: <Advanced />,
	"priority fee": <PriorityFee />,
	confirm: <Confirm />,
};

const Router = () => {
	const { nav } = useContext(WizardContext);

	return <>{ROUTES[nav.steps[nav.currentStep]]}</>;
};
module.exports = Router;
