import path from "path";
import { defineConfig } from "vite";
import nodeExternals from "vite-plugin-node-externals";

// https://vite.dev/config/
export default defineConfig({
    root: path.resolve(import.meta.dirname, "./src/server"),
    build: {
        emptyOutDir: false,
        outDir: path.resolve(import.meta.dirname, "./dist"),
        lib: {
            entry: path.resolve(import.meta.dirname, "./src/server/server.ts"),
            formats: ["es"],
            fileName: () => "server.js",
        },
        sourcemap: true,
        ssr: true
    },
    plugins: [
        nodeExternals({
            builtins: true, // import "node:*"
            deps: true,     // package.json dependencies externalized
        })
    ],
});
