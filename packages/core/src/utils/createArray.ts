/**
 * Performant way to create an array of a given size.
 * @param size The size of the array to create
 * @param value The value to fill the array with
 * @returns The created array
 */
export function createArray<T>(size: number, value: T): T[] {
	const arr = new Array(size);
	let i = 0;
	while (i < size) {
		arr[i] = value;
		i++;
	}
	return arr;
}
