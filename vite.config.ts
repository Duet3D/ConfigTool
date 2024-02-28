import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	base: "/test/",
	build: {
		chunkSizeWarningLimit: 5000000,
		rollupOptions: {
			output: {
				chunkFileNames: "js/[name]-[hash].js",
				entryFileNames: "js/[name]-[hash].js",
				
				assetFileNames: ({ name }) => {
					if (name) {
						if (/\.css$/.test(name)) {
							return "css/[name]-[hash][extname]";
						}
						if (/\.(woff|woff2|ttf)$/.test(name)) {
							return "fonts/[name]-[hash][extname]";
						}
						if (/\.(gif|jpe?g|png|svg)$/.test(name)) {
							return "img/[name]-[hash][extname]";
						}
					}
					
					// default value
					// ref: https://rollupjs.org/guide/en/#outputassetfilenames
					return "assets/[name]-[hash][extname]";
				},
				manualChunks: (id) => {
					if (id.includes("monaco")) {
						return "monaco";
					}
					if (id.includes("CheckInput")) {
						return "components";
					}
				}
			}
		}
	},
	plugins: [
		vue()
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	},
	worker: {
		rollupOptions: {
			output: {
				entryFileNames: "js/[name]-[hash].js"
			}
		}
	}
})
