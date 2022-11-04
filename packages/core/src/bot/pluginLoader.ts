import { Bot, Plugin } from "./bot";

type InferValue<Prop extends PropertyKey, Desc> = Desc extends {
	get(): unknown;
	value: unknown;
}
	? never
	: Desc extends { value: infer T }
	? Record<Prop, T>
	: Desc extends { get(): infer T }
	? Record<Prop, T>
	: never;

type DefineProperty<
	Prop extends PropertyKey,
	Desc extends PropertyDescriptor
> = Desc extends { writable: unknown; set(val: unknown): unknown }
	? never
	: Desc extends { writable: unknown; get(): unknown }
	? never
	: Desc extends { writable: false }
	? Readonly<InferValue<Prop, Desc>>
	: Desc extends { writable: true }
	? InferValue<Prop, Desc>
	: Readonly<InferValue<Prop, Desc>>;

type Merged<T> = {
	value: T;
	writable: false;
};

export function loadPlugin<
	Obj extends object,
	Key extends PropertyKey,
	T extends Plugin<Bot>
>(
	obj: Obj,
	prop: Key,
	val: T
): asserts obj is Obj & DefineProperty<Key, Merged<T>> {
	Object.defineProperty(obj, prop, {
		value: val,
		writable: false,
	});
}
