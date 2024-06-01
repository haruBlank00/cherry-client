import { EventsEnum } from "./constants";
import { daraz } from "./modules/daraz/darazScrapper";
import { scrapTracker } from "./modules/daraz/scrapTracker/ScrapTracker";
import { Pages, checkSite } from "./utils";

// we should better handle comunation with server

(async function () {
  console.log(" i am running");
  const { currentPage, whiteListed } = checkSite();
  if (!whiteListed) {
    console.info(
      "This is not Daraz or page we don't care. Let's not bother..."
    );
    return;
  }

  const isScrapable = await scrapTracker.isScrapable();
  if (!isScrapable) {
    console.log("*** *** ALREADY SCRAPPED *** ***");
    return;
  }

  console.log("*** *** NEW TO SCRAP *** *** ");
  switch (currentPage) {
    case Pages.HOME: {
      const { categories, error } = daraz.scrapCategories();
      if (error) {
        console.error(error);
      } else {
        chrome.runtime.sendMessage({
          type: EventsEnum.SAVE_CATEGORIES,
          data: categories,
        });
      }
      return;
    }

    case Pages.LEVEL_1: {
      console.log("level 1 category");
      break;
    }

    case Pages.LEVEL_2: {
      console.log("level_2");
      break;
    }

    case Pages.PRODUCT: {
      console.log("product page");
      break;
    }
  }
})();
