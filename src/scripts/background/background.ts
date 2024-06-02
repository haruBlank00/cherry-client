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
  switch (messageType) {
    case EventsEnum.SAVE_CATEGORIES: {
      await daraz.saveCategories(data);
      break;
    }

    case EventsEnum.SAVE_PRODUCT: {
      await daraz.saveProduct(data);
      break;
    }

    case EventsEnum.SAVE_PRODUCTS: {
      console.log("ok i m here");
      const saveProductPromises = data.map((product: Product) =>
        daraz.saveProduct(product)
      );

      try {
        const results = await Promise.all(saveProductPromises);
        console.log({ results }, "yappeeee!!!! :)");
      } catch (error) {
        console.log({ error }, "OPPSSS!!! happened :(");
      }

      // await daraz.saveProduct(data);
      break;
    }
    /**
     * let's make a queue to process the links
     * - store link (as queue) on local storage
     * - process the links
     * - update the queue
     */
    // dom parsr doesn't work on background?
    // let'd do it in content script
    // case EventsEnum.QUEUE_LINKS: {
    //   // save the data to local storage
    //   const { currentQueues = [] } = await chrome.storage.local.get(
    //     EventsEnum.QUEUE_LINKS
    //   );
    //   await chrome.storage.local.set({
    //     [EventsEnum.QUEUE_LINKS]: [...currentQueues, ...data],
    //   });

    //   // await queueProcessor.processQueue();
    //   break;
    // }
  }
});
