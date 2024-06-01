import { EventsEnum } from "../constants";
import { daraz } from "../modules/daraz/darazScrapper";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^http/.test(tab.url || "")) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.ts"],
    });
  }
});

chrome.runtime.onMessage.addListener(async (message, _, __) => {
  const { data, type: messageType } = message;
  console.log("what");
  switch (messageType) {
    case EventsEnum.SAVE_CATEGORIES: {
      await daraz.saveCategories(data);
      break;
    }

    case EventsEnum.SAVE_PRODUCT: {
      await daraz.saveProduct(data);
      break;
    }
  }
});

// chrome.tabs.on.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete" && tab.active) {
//     console.log("loogggg");
//   }
// });
