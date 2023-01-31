import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	base: "/next/",
	build: {
		assetsDir: "",
		commonjsOptions: { include: [] },
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("monaco-editor")) {
						return "monaco-editor";
					}
				}
			}
		},
		target: "ES2020"
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
