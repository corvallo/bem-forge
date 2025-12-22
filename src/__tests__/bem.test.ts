import { describe, expect, it } from "vitest";
import { createBem, createBemElement } from "../bem";

describe("createBemElement", () => {
	it("Generates base class and variants", () => {
		const buttonClass = createBemElement({
			block: "button",
			modifiers: {
				size: ["sm", "lg"],
			},
		});

		expect(buttonClass({ size: "sm" })).toBe("button button--sm");
	});

	it("Supports compoundVariants", () => {
		const classFn = createBemElement({
			block: "card",
			element: "footer",
			modifiers: {
				highlight: [true, false],
			},
			compoundModifiers: [
				{
					modifiers: { highlight: true },
					class: "card__footer--highlight",
				},
			],
		});

		expect(classFn({ highlight: true })).toContain("card__footer--highlight");
	});

	it("Throws when block name is missing", () => {
		expect(() => createBemElement({ block: "" as string })).toThrow(
			"react-bem: block name is required",
		);
	});

	it("Handles blocks without modifiers", () => {
		const tagClass = createBemElement({
			block: "tag",
		});

		expect(tagClass()).toBe("tag");
		expect(tagClass({ unexpected: "value" } as any)).toBe("tag");
	});

	it("Merges extra class names via clsx", () => {
		const tagClass = createBemElement({
			block: "tag",
		});

		const result = tagClass({}, ["extra", { active: true }]);
		expect(result).toBe("tag extra active");
	});
});

describe("createBem factory", () => {
	it("Builds block and elements from a single config", () => {
		const modal = createBem({
			block: "modal",
			modifiers: {
				size: ["sm", "lg"],
			},
			elements: {
				footer: {
					modifiers: {
						align: ["start", "end"],
					},
				},
			},
		});

		expect(modal.block({ size: "sm" })).toBe("modal modal--sm");
		expect(modal.elements.footer({ align: "end" })).toBe(
			"modal__footer modal__footer--end",
		);
	});
});

describe("modifierFormat", () => {
	const config = {
		block: "modal",
		modifiers: {
			size: ["sm", "lg"],
			type: ["alert", "confirm"],
		},
	} as const;

	it("uses modifierFormat: 'value' (default)", () => {
		const modalClass = createBemElement({
			...config,
			modifierFormat: "value",
		});

		const result = modalClass({ size: "sm", type: "alert" });

		expect(result).toBe("modal modal--alert modal--sm");
	});

	it("uses modifierFormat: 'key-value'", () => {
		const modalClass = createBemElement({
			...config,
			modifierFormat: "key-value",
		});

		const result = modalClass({ size: "sm", type: "alert" });

		expect(result).toBe("modal modal--size-sm modal--type-alert");
	});

	it("uses fallback 'value' if not specified", () => {
		const modalClass = createBemElement(config);

		const result = modalClass({ size: "lg" });

		expect(result).toBe("modal modal--lg");
	});
});
