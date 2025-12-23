# 🔧 @corvallo/bem-forge

[![npm version](https://img.shields.io/npm/v/@corvallo/bem-forge)](https://www.npmjs.com/package/@corvallo/bem-forge)
[![npm downloads](https://img.shields.io/npm/dm/@corvallo/bem-forge)](https://www.npmjs.com/package/@corvallo/bem-forge)
[![CI](https://img.shields.io/github/actions/workflow/status/corvallo/bem-forge/release.yml)](https://github.com/corvallo/bem-forge/actions)

A flexible and fully typed utility library for managing BEM-style class names in React, with support for modifiers, compound modifiers, CSS Modules, and automatic class merging.
Why bem-forge?

- Fully typed BEM blocks & modifiers
- Zero string concatenation
- Works with CSS Modules
- Prevents invalid class names at compile time

---

## ✨ Features

- ✅ Single config factory (`bem({...})`) for blocks + elements
- ✅ Fully typed modifier system (`ModifierProps`, `ModifierTypes`)
- ✅ Support for compound modifiers
- ✅ `bem.bind` for seamless integration with CSS Modules
- ✅ Automatic class merging via `clsx`
- ✅ Optional modifier formatting (`--value` or `--key-value`)

---

## 🚀 Installation

```bash
pnpm add @corvallo/bem-forge
# or
npm install @corvallo/bem-forge
# or
yarn add @corvallo/bem-forge
```

---

## 📦 Quick Overview

```ts
import { bem, type ModifierTypes } from "@corvallo/bem-forge";
import styles from "./Button.module.scss";

const button = bem({
  block: "button",
  modifiers: {
    size: ["sm", "md", "lg"],
    variant: ["primary", "secondary"],
    fullWidth: [true, false],
  },
  defaultModifiers: { size: "md" },
  compoundModifiers: [{ modifiers: { fullWidth: true }, class: "button--full-width" }],
  elements: {
    icon: {
      modifiers: {
        side: ["left", "right"],
      },
    },
  },
});

export const buttonClasses = bem.bind(styles, button);
export type ButtonVariants = ModifierTypes<typeof button>;
```

Then consume it inside React:

```tsx
type ButtonProps = {
  size?: ButtonVariants["block"]["size"];
  variant?: ButtonVariants["block"]["variant"];
  iconSide?: ButtonVariants["elements"]["icon"]["side"];
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ size, variant, iconSide, className, children, ...rest }: ButtonProps) => (
  <button className={buttonClasses.block({ size, variant }, className)} {...rest}>
    <span className={buttonClasses.elements.icon({ side: iconSide })} aria-hidden />
    {children}
  </button>
);
```

Every builder accepts a second argument, so extra `className` values are merged via `clsx`.

---

## 🧱 API

### `bem(options)`

Creates a block factory (and optional element factories) from a single config.

```ts
const card = bem({
  block: "card",
  modifiers: { size: ["sm", "lg"] },
  elements: {
    header: { modifiers: { align: ["left", "center"] } },
  },
});
```

Call `card.block(props, extras?)` and `card.elements.header(props, extras?)` to build class strings.

### `bem.bind(styles, factory)`

Transforms an entire factory into CSS Module aware helpers.

```ts
const cardClasses = bem.bind(styles, card);

cardClasses.block({ size: "sm" }, "custom"); // → "_card_x _card--sm_x custom"
cardClasses.elements.header({ align: "left" });
```

---

### ✅ Modifier Options

In BEM only elements use `__` (e.g. `block__element`), while modifiers are always appended with `--...`. The `modifierFormat` option just decides whether you emit `--value` or `--key-value`.

| Option              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `modifiers`         | A list of modifier keys with possible values               |
| `defaultModifiers`  | Default values applied when no modifier is passed          |
| `compoundModifiers` | Apply custom class(es) when specific modifier values match |
| `modifierFormat`    | Controls how modifier classes are suffixed (`--value` vs `--key-value`) |

```ts
const modal = bem({
  block: "modal",
  modifiers: {
    size: ["sm", "lg"], // ← `modifiers`
  },
  defaultModifiers: {
    size: "sm", // ← `defaultModifiers`
  },
  compoundModifiers: [
    {
      modifiers: { size: "lg" },
      class: "modal--emphasis",
    },
  ], // ← `compoundModifiers`
});

modal.block({ size: "lg" }); // default => "modal modal--lg"

const modalKeyValue = bem({
  block: "modal",
  modifiers: { size: ["sm", "lg"] },
  modifierFormat: "key-value",
});

modalKeyValue.block({ size: "lg" }); // => "modal modal--size-lg"

// elements follow the same rule: base with "__", modifier with "--"
const footer = bem({
  block: "modal",
  elements: {
    footer: { modifiers: { align: ["start", "end"] }, modifierFormat: "key-value" },
  },
});

footer.elements.footer({ align: "end" }); // "modal__footer modal__footer--align-end"
```

---

## 🧩 Compound Modifiers

```ts
compoundModifiers: [
  {
    modifiers: { variant: "primary", size: "lg" },
    class: "button--highlight",
  },
];
```

---

## 🎨 CSS Modules Integration

`bem.bind(styles, factory)` maps every class generated by the factory to its CSS Module token, so you can keep working with clean names while React receives the hashed version. No more manual `styles[className]` lookups.

---

## 🧠 Typing Utility

`ModifierTypes<typeof factory>` returns the modifier prop types for blocks and elements:

```ts
type ButtonVariants = ModifierTypes<typeof button>;

const size: ButtonVariants["block"]["size"]; // "sm" | "md" | "lg"
const iconSide: ButtonVariants["elements"]["icon"]["side"]; // "left" | "right"
```

---

## 📁 Folder Structure Recommendation

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.module.scss
│       └── button.variants.ts

```
