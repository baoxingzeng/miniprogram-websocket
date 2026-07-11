import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
    // CommonJS
    {
        input: ["src/index.ts", "src/dev.ts"],
        output: {
            dir: "dist/cjs",
            format: "cjs",
            preserveModules: true,
        },
        external: [
            "fetch-xhr-shim",
            "fetch-xhr-shim/dev",
            "miniprogram-platform",
        ],
        plugins: [
            typescript({
                outDir: "dist/cjs",
                declarationDir: "dist/cjs/types",
                moduleResolution: "bundler",
            }),
        ],
    },

    // CommonJS (singlefile)
    {
        input: "src/index.ts",
        output: {
            file: "dist/miniprogram-websocket.cjs.js",
            format: "cjs",
        },
        plugins: [
            typescript({
                declarationDir: "dist/types",
                moduleResolution: "bundler",
            }),
            nodeResolve(),
            babel({
                babelHelpers: "bundled",
                extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"],
            }),
        ],
    },

    // CommonJS (singlefile, minimized)
    {
        input: "src/index.ts",
        output: {
            file: "dist/miniprogram-websocket.cjs.min.js",
            format: "cjs",
        },
        plugins: [
            typescript({
                declarationDir: "dist/types",
                moduleResolution: "bundler",
            }),
            nodeResolve(),
            babel({
                babelHelpers: "bundled",
                extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"],
            }),
            terser(),
        ],
    },

    // ES6
    {
        input: ["src/index.ts", "src/dev.ts"],
        output: {
            dir: "dist/esm",
            format: "es",
            preserveModules: true,
        },
        external: [
            "fetch-xhr-shim",
            "fetch-xhr-shim/dev",
            "miniprogram-platform",
        ],
        plugins: [
            typescript({
                outDir: "dist/esm",
                declarationDir: "dist/esm/types",
                moduleResolution: "bundler",
            }),
        ],
    },

    // ES6 (singlefile)
    {
        input: "src/index.ts",
        output: {
            file: "dist/miniprogram-websocket.esm.js",
            format: "es",
        },
        plugins: [
            typescript({
                declarationDir: "dist/types",
                moduleResolution: "bundler",
            }),
            nodeResolve(),
            babel({
                babelHelpers: "bundled",
                extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"],
            }),
        ],
    },

    // ES6 (singlefile, minimized)
    {
        input: "src/index.ts",
        output: {
            file: "dist/miniprogram-websocket.esm.min.js",
            format: "es",
        },
        plugins: [
            typescript({
                declarationDir: "dist/types",
                moduleResolution: "bundler",
            }),
            nodeResolve(),
            babel({
                babelHelpers: "bundled",
                extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"],
            }),
            terser(),
        ],
    },

    // Types
    {
        input: "dist/esm/types/index.d.ts",
        output: {
            file: "dist/index.d.ts",
            format: "es",
        },
        plugins: [dts()],
    },
    // Types (dev)
    {
        input: "dist/esm/types/dev.d.ts",
        output: {
            file: "dist/dev.d.ts",
            format: "es",
        },
        plugins: [dts()],
    },
];
