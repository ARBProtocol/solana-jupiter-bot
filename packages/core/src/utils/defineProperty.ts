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

export function defineProperty<
	Obj extends object,
	Key extends PropertyKey,
	PDesc extends PropertyDescriptor
>(
	obj: Obj,
	prop: Key,
	val: PDesc
): asserts obj is Obj & DefineProperty<Key, PDesc> {
	Object.defineProperty(obj, prop, val);
}
