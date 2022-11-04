import JSBI from "jsbi";

export const JSBItoNumber = (value: JSBI): number => {
	return JSBI.toNumber(value);
};

export const NumberToJSBI = (value: number): JSBI => {
	return JSBI.BigInt(value);
};

export { JSBI };
