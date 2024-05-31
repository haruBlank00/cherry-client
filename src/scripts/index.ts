import { EventsEnum } from "./constants";
import { daraz } from "./modules/daraz/darazScrapper";
import { Pages, checkSite } from "./utils";

// we should better handle comunation with server

(async function () {
  console.log(" i am running");
  const { currentPage, whiteListed } = checkSite();
  if (!whiteListed) {
    console.info("This is not Daraz. Let's not bother...");
    return;
  }

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
    }
  }
})();
