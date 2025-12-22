import clsx, { type ClassValue } from "clsx";

export type ModifierValue = string | number | boolean;
export type Modifiers = Record<string, readonly ModifierValue[]>;
export type ModifierProps<Defs extends Modifiers> = {
	[K in keyof Defs]?: Defs[K][number];
};

export type ModifierTypes<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends (props: infer P, ...args: any[]) => any
		? NonNullable<P>
		: T[K] extends Record<string, any>
			? ModifierTypes<T[K]>
			: never;
};
type CompoundModifier<Defs extends Modifiers> = {
	modifiers: Partial<ModifierProps<Defs>>;
	class: string | string[];
};
export type BEMOptions<Defs extends Modifiers = {}> = {
	block: string;
	element?: string;
	base?: string;
	modifiers?: Defs;
	defaultModifiers?: Partial<ModifierProps<Defs>>;
	compoundModifiers?: CompoundModifier<Defs>[];
	modifierFormat?: "value" | "key-value"; 
};

export type BemEntryOptions<Defs extends Modifiers = {}> = Omit<
	BEMOptions<Defs>,
	"block" | "element"
>;

export const createBemElement = <Defs extends Modifiers = {}>(
	options: BEMOptions<Defs>,
) => {
	const {
		block,
		element,
		base = "",
		modifiers,
		defaultModifiers = {},
		compoundModifiers = [],
		modifierFormat = "value",
	} = options;

	if (!block) throw new Error("react-bem: block name is required");

	const resolvedModifiers = modifiers ?? ({} as Defs);
	const baseClass = element ? `${block}__${element}` : block;

	return (props: ModifierProps<Defs> = {}, extras?: ClassValue) => {
		const mergedProps = { ...defaultModifiers, ...props };

		const classes = [baseClass];
		if (base) classes.push(base);

		for (const key in resolvedModifiers) {
			if (!Object.hasOwn(resolvedModifiers, key)) continue;
			const value = mergedProps[key as keyof Defs];
			if (value !== undefined && resolvedModifiers[key].includes(value)) {
				const variantClass =
					modifierFormat === "key-value"
						? `${baseClass}--${key}-${value}`
						: `${baseClass}--${value}`;
				classes.push(variantClass);
			}
		}

		for (const compound of compoundModifiers) {
			const matches = Object.entries(compound.modifiers).every(
				([key, value]) => mergedProps[key as keyof Defs] === value,
			);
			if (matches) {
				const raw = Array.isArray(compound.class)
					? compound.class
					: [compound.class];
				classes.push(...raw);
			}
		}
		const baseClasses = classes.filter(Boolean).sort();
		return clsx(baseClasses, extras);
	};
};

export function createBemBlock(block: string) {
	return {
		block: <Defs extends Record<string, any>>(
			options: Omit<BEMOptions<Defs>, "block" | "element">,
		) => createBemElement<Defs>({ block, ...options }),

		element: <Defs extends Record<string, any>>(
			element: string,
			options: Omit<BEMOptions<Defs>, "block" | "element">,
		) => createBemElement<Defs>({ block, element, ...options }),
	};
}

type ExtractModifiers<T> = T extends BemEntryOptions<infer Defs> ? Defs : never;

export type BemElementsResult<
	Elements extends Record<string, BemEntryOptions<any>>,
> = {
	[K in keyof Elements]: ReturnType<
		typeof createBemElement<ExtractModifiers<Elements[K]>>
	>;
};

export type BemFactoryOptions<
	BlockDefs extends Modifiers = {},
	Elements extends Record<string, BemEntryOptions<any>> = {},
> = {
	block: string;
	elements?: Elements;
} & BemEntryOptions<BlockDefs>;

export const createBem = <
	BlockDefs extends Modifiers = {},
	Elements extends Record<string, BemEntryOptions<any>> = {},
>(
	options: BemFactoryOptions<BlockDefs, Elements>,
) => {
	const { block, elements = {} as Elements, ...blockOptions } = options;

	const blockBuilder = createBemElement<BlockDefs>({
		block,
		...(blockOptions as BemEntryOptions<BlockDefs>),
	});

	const elementBuilders = Object.fromEntries(
		Object.entries(elements).map(([name, elementOptions]) => [
			name,
			createBemElement({
				block,
				element: name,
				...(elementOptions as BemEntryOptions),
			}),
		]),
	) as BemElementsResult<Elements>;

	return {
		block: blockBuilder,
		elements: elementBuilders,
	};
};

export type BemFactory<
	BlockDefs extends Modifiers = {},
	Elements extends Record<string, BemEntryOptions<any>> = {},
> = ReturnType<typeof createBem<BlockDefs, Elements>>;
