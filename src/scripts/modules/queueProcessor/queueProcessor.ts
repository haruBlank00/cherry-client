// let's make a queue processor
// this will read queue from storage

import { EventsEnum } from "../../constants";
import { selectXItems } from "../../utils";
import { daraz } from "../daraz/darazScrapper";
import { scrapTracker } from "../scrapTracker/ScrapTracker";

interface QueueProcessorInterface {
  // foolishly process queue in background
  processQueue: () => void;
}
// process the queue and update the queue
class QueueProcessor implements QueueProcessorInterface {
  async processQueue() {
    console.log("processQueue");
    const { QUEUE_LINKS = [] } = await chrome.storage.local.get(
      EventsEnum.QUEUE_LINKS
    );

    while (QUEUE_LINKS.length > 0) {
      const itemsToProcess = selectXItems<string>(QUEUE_LINKS, 1, true).filter(
        (link) => scrapTracker.isScrapable(link)
      );
      const promisesOfLink = itemsToProcess.map(async (url) =>
        daraz.scrapProductFromLink(url)
      );

      try {
        const results = await Promise.all(promisesOfLink);
        await chrome.storage.local.set({
          // ok we can better handle it
          // this QUEUE_LINKS will over ride if que have in added from other tabs?
          [EventsEnum.QUEUE_LINKS]: QUEUE_LINKS,
        });
        console.log({ results });
        return {
          results,
          success: true,
        };
      } catch (error) {
        // if some error occurs
        // let's add the link back to the queue

        await chrome.storage.local.set({
          // ok we can better handle it
          // this QUEUE_LINKS will over ride if que have in added from other tabs?
          [EventsEnum.QUEUE_LINKS]: [...QUEUE_LINKS, ...itemsToProcess],
        });

        if (error instanceof Error) {
          return {
            error,
            success: false,
          };
        }

        return {
          error: new Error("dont' know what happened"),
        };
      }
    }
  }
}

export const queueProcessor = new QueueProcessor();
