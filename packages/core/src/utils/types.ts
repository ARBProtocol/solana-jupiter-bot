export type ReadOnly<T> = {
	readonly [P in keyof T]: T[P];
};

export type Merge<Object1, Object2> = Omit<Object1, keyof Object2> & Object2;
