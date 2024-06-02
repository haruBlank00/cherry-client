import { EventsEnum } from "./constants";
import { daraz } from "./modules/daraz/darazScrapper";
import { scrapTracker } from "./modules/scrapTracker/ScrapTracker";
import { Pages, checkSite } from "./utils";
import { cherryAxios } from "./utils/axios";

// we should better handle comunation with server

const startScrap = async () => {
  const { currentPage, whiteListed } = checkSite();
  if (!whiteListed) {
    console.info(
      "This is not Daraz or page we don't care. Let's not bother..."
    );
    return;
  }

  // console.log({ appData: JSON.parse(appData) });

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
      const url =
        "https://www.daraz.com.np/products/moonstar-stretchable-lights-jacket-women-wrinkle-jacket-fashion-multicolor-hooded-jackets-for-women-womens-wear-i105428083-s1027156225.html?spm=a2a0e.searchlistcategory.sku.1.770c2fd5FR57Pn&search=1";
      const product = await daraz.scrapProductFromLink(url);
      break;
    }

    case Pages.LEVEL_2: {
      console.log("level_2");
      break;
    }

    case Pages.PRODUCT: {
      console.log("product page");
      const product = daraz.scrapProduct();
      if (product) {
        console.log("event emittttt");
        chrome.runtime.sendMessage({
          type: EventsEnum.SAVE_PRODUCT,
          data: product,
        });
      }
    }
  }
};
startScrap();

window.addEventListener("load", () => {
  try {
    startScrap();
  } catch (error) {
    console.error("Error in startScrap:", error);
  }
});
