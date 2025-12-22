import { createBem } from "./bem";
import { bind } from "./bind-bem";

export const bem = Object.assign(createBem, { bind });
export type { ModifierTypes } from "./bem";
