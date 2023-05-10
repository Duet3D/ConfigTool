import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	base: "/next/",
	build: {
		commonjsOptions: { include: [] },
		target: "ES2020",
		chunkSizeWarningLimit: 3145728	// 3MiB
	},
	optimizeDeps: {
		disabled: false,
	},
	plugins: [
		checker({ typescript: true }),
		vue()
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	}
});
