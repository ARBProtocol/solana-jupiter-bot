type Cache<T> = {
	maxItems: number;
	cache: {
		key: string;
		value: T;
	}[];
	set(key: string, value: T): string;
	get(key: string): T | undefined;
	getAll(): {
		key: string;
		value: T;
	}[];
};

export const createCache = <T>() => {
	const Cache: Cache<T> = {
		maxItems: 10,
		cache: [],
		set(key, value) {
			if (!key || !value) throw new Error("Cache: invalid key or value");
			if (this.cache.find((i) => i.key === key)) {
				throw new Error("Cache: key already exists");
			}
			this.cache.push({ key, value });
			if (this.cache.length > this.maxItems) {
				this.cache.shift();
			}
			return key;
		},
		get(key) {
			const item = this.cache.find((i) => i.key === key);
			if (item) {
				return item.value;
			}
			return undefined;
		},
		getAll() {
			return this.cache;
		},
	};

	return {
		...Cache,
	};
};
