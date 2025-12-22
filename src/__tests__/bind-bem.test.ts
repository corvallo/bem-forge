import { describe, it, expect } from "vitest";
import { bindBemClass, bind } from "../bind-bem";
import { createBem } from "../bem";

describe("bindAll", () => {
  const styles = {
    btn: "_btn_abc123",
    "btn--primary": "_btn--primary_abc123",
    "btn--large": "_btn--large_abc123",
    "btn__icon": "_btn__icon_abc123",
    "btn__icon--lg": "_btn__icon--lg_abc123",
  };

  const mockFn = (props?: { variant?: "primary" | "secondary"; size?: "large" }) => {
    const classes = ["btn"];
    if (props?.variant === "primary") classes.push("btn--primary");
    if (props?.size === "large") classes.push("btn--large");
    return classes.join(" ");
  };

  it("Normalizes whitespace when binding classes", () => {
    const mapper = bindBemClass(styles, () => "btn  btn--primary\n  btn--large\t");
    expect(mapper()).toBe("_btn_abc123 _btn--primary_abc123 _btn--large_abc123");
  });

  it("Binds entire factories via bem.bind", () => {
    const button = createBem({
      block: "btn",
      elements: {
        icon: {
          modifiers: {
            size: ["sm", "lg"],
          },
        },
      },
      modifiers: {
        variant: ["primary"],
      },
    });

    const bound = bind(styles, button);

    expect(bound.block({ variant: "primary" })).toBe("_btn_abc123 _btn--primary_abc123");
    expect(bound.elements.icon({ size: "lg" })).toBe("_btn__icon_abc123 _btn__icon--lg_abc123");
  });
});
