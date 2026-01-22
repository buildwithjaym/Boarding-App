import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                tenant: resolve(__dirname, "tenant/index.html"),
                owner: resolve(__dirname, "owner/index.html"),
            },
        },
    },
});

