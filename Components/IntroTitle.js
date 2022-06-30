const React = require("react");
const BigText = require("ink-big-text");
const Gradient = require("ink-gradient");

const IntroTitle = () => {
	return (
		<Gradient colors={["#4b9db0", "#8deef5", "#cdd4a2", "#e2a659"]}>
			<BigText text="Solana Jupiter Bot" font="tiny" lineHeight={10}></BigText>
		</Gradient>
	);
};

module.exports = IntroTitle;
