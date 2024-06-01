import { EventsEnum } from "../constants";
import { daraz } from "../modules/daraz/darazScrapper";
import { Message } from "./types";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^http/.test(tab.url || "")) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.ts"],
    });
  }
});

chrome.runtime.onMessage.addListener(async (message: Message, _, __) => {
  const { data, type: messageType } = message;

  switch (messageType) {
    case EventsEnum.SAVE_CATEGORIES: {
      console.log("time to save categories to be", data);
      await daraz.saveCategories(data);
      break;
    }
  }
});

// chrome.tabs.on.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete" && tab.active) {
//     console.log("loogggg");
//   }
// });
