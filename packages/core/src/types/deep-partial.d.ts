/* eslint-disable @typescript-eslint/ban-types */
export type DeepPartial<T> = T extends Function
	? T
	: T extends Array<infer InferredArrayMember>
	? DeepPartialArray<InferredArrayMember>
	: T extends object
	? DeepPartialObject<T>
	: T | undefined;

type DeepPartialArray<T> = Array<DeepPartial<T>>;

type DeepPartialObject<T> = {
	[Key in keyof T]?: DeepPartial<T[Key]>;
};
