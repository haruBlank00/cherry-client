import { EventsEnum } from "./constants";
import { daraz } from "./modules/daraz/darazScrapper";
import { checkSite } from "./utils";

// we should better handle comunation with server

(async function () {
  const shoulIScrap = checkSite();
  if (!shoulIScrap) {
    console.info("This is not Daraz. Let's not bother...");
    return;
  }

  const { categories, error } = daraz.scrapCategories();
  if (error) {
    console.error(error);
  } else {
    chrome.runtime.sendMessage({
      type: EventsEnum.SAVE_CATEGORIES,
      data: categories,
    });
  }
})();
