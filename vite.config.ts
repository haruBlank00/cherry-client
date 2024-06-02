import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import { manifest } from "./manifest";
import libCss from "vite-plugin-libcss";

export default defineConfig({
  plugins: [crx({ manifest }), libCss()],
});
