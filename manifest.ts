import { ManifestV3Export } from "@crxjs/vite-plugin";

/** CONFIGURATION FOR OUR MANIFEST.JSON */
export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: "Cherry Scrapper",
  description: "Scrap Daraz products",
  version: "2.0",

  icons: {
    "16": "images/icon-16.png",
    "32": "images/icon-32.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png",
  },

  action: {
    default_popup: "index.html",
    default_icon: {
      "16": "images/icon-16.png",
      "32": "images/icon-32.png",
      "48": "images/icon-48.png",
      "128": "images/icon-128.png",
    },
  },

  permissions: ["webRequest", "storage", "activeTab"],

  background: {
    service_worker: "src/scripts/background/background.ts",
    type: "module",
  },

  content_scripts: [
    {
      // matches: ["*://*/*"],
      matches: ["<all_urls>"],
      js: ["src/scripts/index.ts"],
      // css: ["src/style.css"],
    },
  ],
  web_accessible_resources: [
    {
      resources: ["*.js", "*.css", "*.svg"],
      matches: ["*://*/*"],
    },
  ],
};
