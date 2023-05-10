export const parseError = (e: unknown) => {
	if (
		typeof e === "object" &&
		e &&
		"message" in e &&
		typeof e.message === "string"
	) {
		return e as Error;
	}
};
