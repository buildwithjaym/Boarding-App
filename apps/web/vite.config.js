import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                tenant: resolve(__dirname, "tenant/index.html"),
                listing: resolve(__dirname, "tenant/listing.html"),
                owner: resolve(__dirname, "owner/dashboard.html"),
                ownerCreate: resolve(__dirname, "owner/listing-create.html")
            }
        }
    }
});
