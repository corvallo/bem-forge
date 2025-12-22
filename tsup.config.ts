// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	sourcemap: false,
	minify: true,
	target: "node12",
	splitting: true,
});
