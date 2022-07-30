"use strict";

require("dotenv").config();
const React = require("react");

// create temp dir
const { createTempDir } = require("../utils");
createTempDir();

// import components
const importJsx = require("import-jsx");

const WizardProvider = importJsx("./WizardProvider");

const Layout = importJsx("./Components/Layout");

const App = (props) => {
	return (
		<WizardProvider>
			<Layout></Layout>
		</WizardProvider>
	);
};

module.exports = App;
