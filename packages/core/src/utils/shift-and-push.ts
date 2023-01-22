export const shiftAndPush = (values: number[], newVal: number) => {
	values.push(newVal);
	values.shift();
	return values;
};
