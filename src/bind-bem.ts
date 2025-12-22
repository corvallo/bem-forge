import type { BemElementsResult, BemEntryOptions, BemFactory } from "./bem";

export const bindBemClass = <Args extends unknown[], Return extends string>(
	styles: Record<string, string>,
	fn: (...args: Args) => Return,
): ((...args: Args) => string) => {
	return (...args) => {
		const className = fn(...args);
		const tokens = className.match(/\S+/g) ?? [];
		return tokens.map((cls) => styles[cls] || cls).join(" ");
	};
};

export const bind = <
	BlockDefs extends Record<string, any>,
	Elements extends Record<string, BemEntryOptions<any>>,
	Factory extends BemFactory<BlockDefs, Elements>,
>(
	styles: Record<string, string>,
	factory: Factory,
) => {
	const boundBlock = bindBemClass(styles, factory.block);
	const boundElements = Object.fromEntries(
		Object.entries(factory.elements).map(([key, fn]) => [
			key,
			bindBemClass(styles, fn as (...args: any[]) => string),
		]),
	) as BemElementsResult<Elements>;

	return {
		block: boundBlock,
		elements: boundElements,
	};
};
